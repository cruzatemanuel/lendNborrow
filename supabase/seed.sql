-- ================================================================
-- lendNborrow — Seed Data
-- Creates test users, profiles, items, and borrow requests.
--
-- USAGE:
--   Option A (Supabase CLI): supabase db reset   (runs migrations + seed)
--   Option B (Manual):       Paste in SQL Editor after running migrations
--
-- Default password for all seed accounts: Password123!
-- ================================================================

-- ── Auth Users ─────────────────────────────────────────────
-- These inserts work with `supabase db reset` (local dev).
-- For a remote Supabase project, create users via Dashboard or Auth Admin API.

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES
  -- Admin 1
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated',
   'admin@lendnborrow.test',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Admin 2
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated',
   'admin2@lendnborrow.test',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Student: active (verified)
  ('00000000-0000-0000-0000-000000000000',
   'b0000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated',
   'lance@student.batstate-u.edu.ph',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Student: active (verified)
  ('00000000-0000-0000-0000-000000000000',
   'b0000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated',
   'mikayla@student.batstate-u.edu.ph',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Student: pending verification
  ('00000000-0000-0000-0000-000000000000',
   'b0000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated',
   'pending@student.batstate-u.edu.ph',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Student: new (just registered)
  ('00000000-0000-0000-0000-000000000000',
   'b0000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated',
   'newuser@student.batstate-u.edu.ph',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', ''),

  -- Student: rejected
  ('00000000-0000-0000-0000-000000000000',
   'b0000000-0000-0000-0000-000000000005',
   'authenticated', 'authenticated',
   'rejected@student.batstate-u.edu.ph',
   crypt('Password123!', gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}', '{}',
   now(), now(), '', '');

-- Auth identities (required for email/password login)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   jsonb_build_object('sub','a0000000-0000-0000-0000-000000000001','email','admin@lendnborrow.test'),
   'email','a0000000-0000-0000-0000-000000000001', now(), now(), now()),

  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
   jsonb_build_object('sub','a0000000-0000-0000-0000-000000000002','email','admin2@lendnborrow.test'),
   'email','a0000000-0000-0000-0000-000000000002', now(), now(), now()),

  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   jsonb_build_object('sub','b0000000-0000-0000-0000-000000000001','email','lance@student.batstate-u.edu.ph'),
   'email','b0000000-0000-0000-0000-000000000001', now(), now(), now()),

  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
   jsonb_build_object('sub','b0000000-0000-0000-0000-000000000002','email','mikayla@student.batstate-u.edu.ph'),
   'email','b0000000-0000-0000-0000-000000000002', now(), now(), now()),

  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
   jsonb_build_object('sub','b0000000-0000-0000-0000-000000000003','email','pending@student.batstate-u.edu.ph'),
   'email','b0000000-0000-0000-0000-000000000003', now(), now(), now()),

  ('b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
   jsonb_build_object('sub','b0000000-0000-0000-0000-000000000004','email','newuser@student.batstate-u.edu.ph'),
   'email','b0000000-0000-0000-0000-000000000004', now(), now(), now()),

  ('b0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
   jsonb_build_object('sub','b0000000-0000-0000-0000-000000000005','email','rejected@student.batstate-u.edu.ph'),
   'email','b0000000-0000-0000-0000-000000000005', now(), now(), now());


-- ── Profiles ───────────────────────────────────────────────

INSERT INTO public.profiles (
  id, role, full_name, student_number, college, campus,
  contact, verification_status
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin',
   'Admin One', NULL, NULL, 'Pablo Borbon', NULL, 'active'),

  ('a0000000-0000-0000-0000-000000000002', 'admin',
   'Admin Two', NULL, NULL, 'Pablo Borbon', NULL, 'active'),

  ('b0000000-0000-0000-0000-000000000001', 'student',
   'Lance Pria', '21-00101', 'CICS', 'Pablo Borbon',
   '09171234567', 'active'),

  ('b0000000-0000-0000-0000-000000000002', 'student',
   'Mikayla Banaag', '21-00102', 'CICS', 'Pablo Borbon',
   '09179876543', 'active'),

  ('b0000000-0000-0000-0000-000000000003', 'student',
   'Pending Student', '21-00103', 'CET', 'Alangilan',
   '09181112222', 'pending'),

  ('b0000000-0000-0000-0000-000000000004', 'student',
   'New Student', '21-00104', 'CAS', 'Pablo Borbon',
   '09193334444', 'new'),

  ('b0000000-0000-0000-0000-000000000005', 'student',
   'Rejected Student', '21-00105', 'CABEIHM', 'Alangilan',
   '09205556666', 'rejected')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  student_number = EXCLUDED.student_number,
  college = EXCLUDED.college,
  campus = EXCLUDED.campus,
  contact = EXCLUDED.contact,
  verification_status = EXCLUDED.verification_status;


-- ── Items (owned by active students) ───────────────────────

INSERT INTO public.items (
  id, owner_id, title, description, category, condition, status
) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'TI-84 Plus Calculator', 'Graphing calculator, great for calculus and statistics.',
   'Electronics', 'good', 'available'),

  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'Introduction to Algorithms (CLRS)', 'Classic CS textbook, 4th edition. Some highlighting.',
   'Books', 'fair', 'available'),

  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000001',
   'Arduino Uno Starter Kit', 'Includes board, breadboard, wires, LEDs, and sensors.',
   'Electronics', 'like_new', 'borrowed'),

  ('c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000002',
   'Badminton Racket', 'Yonex Astrox 88D, recently restrung.',
   'Sports', 'good', 'available'),

  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000002',
   'Electric Kettle', '1.5L stainless steel, heats up quickly.',
   'Kitchen', 'good', 'borrowed'),

  ('c0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000002',
   'Multimeter', 'Digital multimeter for circuit testing. Includes probes.',
   'Tools', 'like_new', 'available'),

  ('c0000000-0000-0000-0000-000000000007',
   'b0000000-0000-0000-0000-000000000001',
   'Lab Coat (Medium)', 'White lab coat, fits medium build. Clean and pressed.',
   'Clothing', 'good', 'unavailable'),

  ('c0000000-0000-0000-0000-000000000008',
   'b0000000-0000-0000-0000-000000000002',
   'USB-C Hub (7-in-1)', 'HDMI, USB-A ×2, SD, microSD, USB-C PD passthrough.',
   'Electronics', 'new', 'available'),

  ('c0000000-0000-0000-0000-000000000009',
   'b0000000-0000-0000-0000-000000000001',
   'Physics for Scientists & Engineers', 'Serway & Jewett, 10th ed. No markings.',
   'Books', 'like_new', 'available'),

  ('c0000000-0000-0000-0000-000000000010',
   'b0000000-0000-0000-0000-000000000002',
   'Extension Cord (5m)', '4-socket surge-protected extension cord.',
   'Electronics', 'good', 'available');


-- ── Borrow Requests (various statuses) ─────────────────────

INSERT INTO public.borrow_requests (
  id, item_id, borrower_id, owner_id, status,
  start_date, due_date, message, picked_up_at,
  return_submitted_at, returned_at, return_condition, rejection_reason
) VALUES
  -- Pending: Mikayla wants Lance's calculator
  ('d0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'pending',
   CURRENT_DATE + 1, CURRENT_DATE + 8,
   'Hi! I need this for my stats exam next week.', NULL, NULL, NULL, NULL, NULL),

  -- Approved: Lance wants Mikayla's badminton racket
  ('d0000000-0000-0000-0000-000000000002',
   'c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000002',
   'approved',
   CURRENT_DATE, CURRENT_DATE + 5,
   'Want to play badminton this weekend!', NULL, NULL, NULL, NULL, NULL),

  -- Borrowing: Mikayla is borrowing Lance's Arduino kit
  ('d0000000-0000-0000-0000-000000000003',
   'c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'borrowing',
   CURRENT_DATE - 3, CURRENT_DATE + 4,
   'For our IoT project.', now() - interval '3 days', NULL, NULL, NULL, NULL),

  -- Return submitted: Lance submitted return for Mikayla's kettle
  ('d0000000-0000-0000-0000-000000000004',
   'c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000002',
   'return_submitted',
   CURRENT_DATE - 7, CURRENT_DATE - 1,
   'Need to boil water for coffee.', now() - interval '7 days',
   now() - interval '1 day', NULL, 'good', NULL),

  -- Returned: completed transaction
  ('d0000000-0000-0000-0000-000000000005',
   'c0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000002',
   'returned',
   CURRENT_DATE - 14, CURRENT_DATE - 7,
   'Need to test my circuit board.', now() - interval '14 days',
   now() - interval '8 days', now() - interval '7 days', 'good', NULL),

  -- Rejected: owner rejected the request
  ('d0000000-0000-0000-0000-000000000006',
   'c0000000-0000-0000-0000-000000000009',
   'b0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'rejected',
   CURRENT_DATE - 5, CURRENT_DATE,
   'I need this for physics.', NULL, NULL, NULL, NULL,
   'Sorry, I need the book for my own exam.'),

  -- Cancelled: borrower cancelled
  ('d0000000-0000-0000-0000-000000000007',
   'c0000000-0000-0000-0000-000000000010',
   'b0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000002',
   'cancelled',
   CURRENT_DATE - 2, CURRENT_DATE + 3,
   'Could I borrow this for the weekend?', NULL, NULL, NULL, NULL, NULL);

