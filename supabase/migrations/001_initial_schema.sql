-- ================================================================
-- lendNborrow — Initial Database Schema
-- Run in Supabase SQL Editor or via supabase db reset
-- ================================================================

-- ── Custom enum types ──────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.user_role AS ENUM ('student', 'admin');

CREATE TYPE public.verification_status AS ENUM (
  'new', 'pending', 'active', 'rejected', 'suspended', 'locked'
);

CREATE TYPE public.item_status AS ENUM (
  'available', 'borrowed', 'unavailable', 'lost'
);

CREATE TYPE public.item_condition AS ENUM (
  'new', 'like_new', 'good', 'fair', 'poor'
);

CREATE TYPE public.request_status AS ENUM (
  'pending', 'approved', 'borrowing', 'return_submitted', 'returned',
  'rejected', 'cancelled'
);

-- ── Profiles table ─────────────────────────────────────────
-- One row per auth user. The id column references auth.users.

CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                public.user_role        NOT NULL DEFAULT 'student',
  full_name           TEXT                    NOT NULL,
  student_number      TEXT                    UNIQUE,
  college             TEXT,
  campus              TEXT,
  contact             TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'new',
  id_image_url        TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ             NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ             NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_verification ON public.profiles(verification_status);
CREATE INDEX idx_profiles_role          ON public.profiles(role);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New user'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Items table ────────────────────────────────────────────

CREATE TABLE public.items (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT           NOT NULL,
  description TEXT,
  category    TEXT           NOT NULL,
  condition   public.item_condition NOT NULL DEFAULT 'good',
  image_url   TEXT,
  status      public.item_status    NOT NULL DEFAULT 'available',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_owner    ON public.items(owner_id);
CREATE INDEX idx_items_status   ON public.items(status);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_created  ON public.items(created_at DESC);

-- ── Borrow Requests table ──────────────────────────────────

CREATE TABLE public.borrow_requests (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id             UUID            NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  borrower_id         UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id            UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              public.request_status NOT NULL DEFAULT 'pending',
  start_date          DATE            NOT NULL,
  due_date            DATE            NOT NULL,
  picked_up_at        TIMESTAMPTZ,
  return_submitted_at TIMESTAMPTZ,
  returned_at         TIMESTAMPTZ,
  return_condition    public.item_condition,
  message             TEXT,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

  -- A borrower can't borrow their own item
  CONSTRAINT chk_not_self_borrow CHECK (borrower_id != owner_id),
  -- Due date must be after the start date
  CONSTRAINT chk_dates CHECK (due_date > start_date)
);

CREATE INDEX idx_requests_item     ON public.borrow_requests(item_id);
CREATE INDEX idx_requests_borrower ON public.borrow_requests(borrower_id);
CREATE INDEX idx_requests_owner    ON public.borrow_requests(owner_id);
CREATE INDEX idx_requests_status   ON public.borrow_requests(status);
CREATE UNIQUE INDEX idx_requests_one_pending_per_borrower_item
  ON public.borrow_requests(item_id, borrower_id)
  WHERE status = 'pending';

-- ── Auto-update updated_at trigger ─────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_items_updated
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_requests_updated
  BEFORE UPDATE ON public.borrow_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Storage buckets ─────────────────────────────────────────
-- Browser uploads are never direct: Express uploads using the service role.
-- Item images are public; student IDs remain private.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('item-images', 'item-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('student-id-images', 'student-id-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── Row Level Security ─────────────────────────────────────
-- The browser never queries Supabase directly. Express performs authorization
-- before using its service-role client, while RLS denies direct client access.

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

