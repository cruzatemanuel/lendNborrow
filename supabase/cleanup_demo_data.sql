-- ========================================================
-- lendNborrow: Standalone Demo & Test Data Cleanup Script
-- Safe to execute in the Supabase SQL Editor.
-- Removes all seeded demo accounts, sample listings, and test
-- borrow requests without altering tables, constraints,
-- SQL functions, triggers, or Row Level Security (RLS) policies.
-- ========================================================

BEGIN;

-- 1. Identify demo and test user IDs in public.profiles and auth.users
CREATE TEMP TABLE _demo_user_ids ON COMMIT DROP AS
SELECT id
FROM auth.users
WHERE email ILIKE 'demo%@g.batstate-u.edu.ph'
   OR email ILIKE 'test%@g.batstate-u.edu.ph'
   OR email ILIKE 'smoke%@g.batstate-u.edu.ph'
   OR email IN (
     'demo1@g.batstate-u.edu.ph',
     'demo2@g.batstate-u.edu.ph',
     'demo3@g.batstate-u.edu.ph'
   )
UNION
SELECT id
FROM public.profiles
WHERE email ILIKE 'demo%@g.batstate-u.edu.ph'
   OR email ILIKE 'test%@g.batstate-u.edu.ph'
   OR email ILIKE 'smoke%@g.batstate-u.edu.ph'
   OR student_number IN ('21-00101', '21-00202', '21-00303', '00-00000');

-- 2. Identify seeded sample items and smoke-test items
CREATE TEMP TABLE _demo_item_ids ON COMMIT DROP AS
SELECT id
FROM public.items
WHERE owner_id IN (SELECT id FROM _demo_user_ids)
   OR title IN (
     'Texas Instruments TI-84 Plus CE Graphing Calculator',
     'Arduino Uno R3 Starter Kit with Sensors',
     'Rotring Technical Drafting Pen Set & T-Square',
     'Anker USB-C Hub Multi-port 8-in-1 Adapter',
     'Digital Multimeter & Electronic Soldering Station 60W',
     'Stainless Steel Digital Vernier Caliper (150mm)',
     'Introduction to Algorithms (CLRS 3rd Edition)',
     'Fluid Mechanics & Engineering Thermodynamics Reviewer',
     'Logitech Wireless Presentation Clicker with Red Laser',
     'Smoke Test Scientific Calculator'
   );

-- 3. Delete borrow requests tied to demo users or demo items first
DELETE FROM public.borrow_requests
WHERE item_id IN (SELECT id FROM _demo_item_ids)
   OR borrower_id IN (SELECT id FROM _demo_user_ids)
   OR owner_id IN (SELECT id FROM _demo_user_ids)
   OR message IN (
     'Need calculator for calculus midterm exam.',
     'Borrowing for laboratory project prototype.',
     'Need T-square for plate submission this Friday.',
     'Used for breadboard testing. Returning today.',
     'Smoke test borrow request.'
   );

-- 4. Delete demo items
DELETE FROM public.items
WHERE id IN (SELECT id FROM _demo_item_ids);

-- 5. Delete storage objects uploaded by demo users (if any exist in item-images)
DELETE FROM storage.objects
WHERE bucket_id = 'item-images'
  AND (
    owner IN (SELECT id FROM _demo_user_ids)
    OR split_part(name, '/', 1) IN (SELECT id::text FROM _demo_user_ids)
  );

-- 6. Delete demo profiles
DELETE FROM public.profiles
WHERE id IN (SELECT id FROM _demo_user_ids);

-- 7. Delete demo auth users (cascades to auth.identities, auth.sessions, etc.)
DELETE FROM auth.users
WHERE id IN (SELECT id FROM _demo_user_ids);

COMMIT;
