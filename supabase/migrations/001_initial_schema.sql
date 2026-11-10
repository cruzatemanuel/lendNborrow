-- ========================================================
-- lendNborrow: Migration 001 - Initial Schema
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. Profiles Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  student_number TEXT NOT NULL DEFAULT '',
  college TEXT NOT NULL DEFAULT '',
  campus TEXT NOT NULL DEFAULT 'Alangilan',
  contact TEXT DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'active', 'suspended')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_batstateu_email CHECK (email ~* '^[^@\s]+@g\.batstate-u\.edu\.ph$')
);

-- --------------------------------------------------------
-- 2. Items Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Good',
  pickup_location TEXT NOT NULL DEFAULT 'Alangilan Campus',
  max_borrow_days INTEGER NOT NULL DEFAULT 7 CHECK (max_borrow_days > 0),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'unavailable', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------
-- 3. Borrow Requests Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'borrowing', 'return_submitted', 'returned', 'rejected', 'cancelled')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  picked_up_at TIMESTAMPTZ,
  return_submitted_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  return_condition TEXT,
  message TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_date_range CHECK (due_date >= start_date)
);

-- --------------------------------------------------------
-- 4. Indexes for Query Performance
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_borrow_requests_item_id ON public.borrow_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_borrower_id ON public.borrow_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_owner_id ON public.borrow_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON public.borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_created_at ON public.borrow_requests(created_at DESC);

-- --------------------------------------------------------
-- 5. Row Level Security (RLS)
-- Enabled on every table with NO public policies.
-- Express API server uses the service-role key to access tables.
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 6. Storage Bucket for Item Images
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

