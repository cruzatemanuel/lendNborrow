# lendNborrow Setup Checklist

This document is the contract for manual configuration, credentials, Supabase dashboard settings, and local setup. Real secrets are never committed.

---

## 1. Supabase Project Creation

- [x] Create a Supabase project at [https://supabase.com/dashboard](https://supabase.com/dashboard)
  - **Project Name:** `lendnborrow`
  - **Database Password:** Store securely
  - **Region:** Southeast Asia (Singapore) or East Asia (Tokyo)
- [x] Retrieve API credentials from **Project Settings → API**:
  - `SUPABASE_URL` (e.g., `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
  - `SUPABASE_ANON_KEY` (Project API Keys → anon / public)
  - `SUPABASE_SERVICE_ROLE_KEY` (Project API Keys → service_role / secret)

---

## 2. Supabase Authentication Settings

### 2.1 Email Auth & Domain Restriction
- [ ] Go to **Authentication → Providers → Email**:
  - **Enable Email provider:** Yes
  - **Confirm email:** Yes (Enabled)
  - **Secure email change:** Disabled (or default)
- [ ] Go to **Authentication → URL Configuration**:
  - **Site URL:** `http://localhost:3000` (or your production `APP_BASE_URL`)
  - **Redirect URLs (Allow list):**
    - `http://localhost:3000/signin.html?confirmed=1`
    - `http://localhost:3000/auth-callback.html`

### 2.2 Optional Google OAuth (Only if GOOGLE_AUTH_ENABLED=true)
- [ ] In Google Cloud Console, configure OAuth 2.0 Client credentials:
  - Authorized redirect URI: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
- [ ] In Supabase Dashboard → **Authentication → Providers → Google**:
  - Toggle **Enable Google provider**
  - Enter Client ID & Secret
- [ ] Note: Non-`@g.batstate-u.edu.ph` accounts are rejected and deleted by the backend during callback verification.

---

## 3. Storage Bucket for Item Images

- [ ] Go to **Storage → Buckets → New bucket**:
  - **Name:** `item-images` (matches `SUPABASE_STORAGE_BUCKET`)
  - **Public bucket:** Enabled (Public read access for item image URLs)
  - **File size limit:** 5 MB
  - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

---

## 4. Database Migrations

Run the SQL migration scripts in order in the **Supabase Dashboard → SQL Editor**:

1. `supabase/migrations/001_initial_schema.sql`
   - Creates `profiles`, `items`, and `borrow_requests` tables.
   - Enforces `@g.batstate-u.edu.ph` email domain validation constraint.
   - Sets up indexes for search, status, and foreign keys.
   - Enables Row Level Security (RLS) on all tables (no public policies; backend uses service-role key).
   - Configures storage bucket helper entry.
2. `supabase/migrations/002_functions.sql`
   - Defines atomic SQL functions: `approve_request` and `confirm_return`.
3. (Optional) `supabase/seed.sql`
   - Provides direct SQL seed data as reference.

---

## 5. Local Environment Configuration

- [ ] Copy `server/.env.example` to `server/.env`:
  ```bash
  cp server/.env.example server/.env
  ```
- [ ] Fill in real values in `server/.env`:
  ```env
  PORT=3000
  APP_BASE_URL=http://localhost:3000
  COOKIE_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
  ALLOWED_EMAIL_DOMAIN=@g.batstate-u.edu.ph
  SUPABASE_URL=YOUR_SUPABASE_URL
  SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_STORAGE_BUCKET=item-images
  GOOGLE_AUTH_ENABLED=false
  SEED_DEMO_PASSWORD=CHANGE_ME_DEMO_PASSWORD
  ```

---

## 6. Install Dependencies & Run

```bash
# Install server dependencies
npm --prefix server install

# Run seed script to create demo users and test data (requires valid Supabase credentials)
npm --prefix server run seed

# Start development server
npm --prefix server run dev
# OR
npm start
```

### Health Check Verification
- Open `http://localhost:3000/api/health`
- When placeholders are present: returns `503` with `{ ok: false, supabase: "not configured" }` (server stays running).
- When configured: returns `200` with `{ ok: true, supabase: "connected" }`.

---

## 7. Demo Accounts (Created by `npm --prefix server run seed`)

All demo accounts use the password configured in `SEED_DEMO_PASSWORD`:
1. `demo1@g.batstate-u.edu.ph` — Juan Dela Cruz (CICS, Alangilan)
2. `demo2@g.batstate-u.edu.ph` — Maria Santos (CEAFA, Alangilan)
3. `demo3@g.batstate-u.edu.ph` — Paolo Reyes (CIT, Alangilan)

---

## 8. Smoke Test

Run the full end-to-end lending lifecycle smoke test:
```bash
npm --prefix server run smoke
```

