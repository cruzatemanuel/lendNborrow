# lendNborrow Setup Checklist (Phase 1)

**Complete each step before writing any server/application code.**  
All items are manual Supabase Dashboard or local configuration steps.

---

## 1. Supabase Project Creation

- [ ] **Create a new Supabase project** at https://supabase.com/dashboard
  - Project name: `lendnborrow`
  - Region: Choose closest to BatStateU (e.g., Singapore or Tokyo)
  - Database password: Generate and store securely (you'll need it for migrations)
  - **Do not enable** "Enable realtime" or "Enable pgvector" unless needed later
- [ ] Note the **Project URL** (e.g., `https://xxxxx.supabase.co`) and **Project API keys** (Anon Key, Service Role Key) — these go in `server/.env`

---

## 2. Supabase Auth Configuration (Critical for MVP)

### 2.1 Email Domain Restriction

- [ ] Go to **Authentication → Settings → Email Auth**
- [ ] Under **Email confirmation**, enable **Confirm email**
- [ ] Under **Email allowlist**, add: `@g.batstate-u.edu.ph`
  - This restricts sign-ups to only BatStateU GSuite accounts
  - Any non-`@g.batstate-u.edu.ph` email will be rejected at the Auth level
- [ ] Disable **Email change confirmation** (not needed for MVP)
- [ ] Disable **Phone auth** (not used)
- [ ] Disable **Magic link / OTP** (use email/password + confirmation only)

### 2.2 Auth Providers

- [ ] **Google OAuth**: **Do NOT enable** for MVP
  - Phase 6 stretch feature only
  - If enabled later, restrict to `@g.batstate-u.edu.ph` via Google Cloud Console
- [ ] **Email/Password**: Keep as the only enabled provider for MVP

### 2.3 Email Templates

- [ ] Go to **Authentication → Email Templates**
- [ ] Customize **Confirm signup** template:
  - Subject: `Verify your lendNborrow account`
  - Body: Include `{{ .ConfirmationURL }}` link and mention BatStateU student verification
- [ ] Test the email flow after creating a test user

---

## 3. Supabase Storage Bucket for Item Images

- [ ] Go to **Storage → Create bucket**
- [ ] Bucket name: `item-images`
- [ ] **Public bucket**: **No** (keep private; serve images via signed URLs or server-side proxy)
- [ ] **File size limit**: `5 MB` (or `10 MB` max)
- [ ] **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- [ ] **RLS Policies** (set after migrations):
  - Owners can upload to their own folder
  - Anyone authenticated can read (or serve via signed URL from backend)
  - Bucket policies are created via SQL migrations (see Step 5)

---

## 4. Database Setup & Migrations

### 4.1 Run Migrations in Order

Migrations live in `server/migrations/` (to be created). Execute in Supabase **SQL Editor** in this order:

| # | Migration File | Purpose |
|---|----------------|---------|
| 1 | `001_create_profiles.sql` | `profiles` table with GSuite domain check constraint, verification status enum |
| 2 | `002_create_items.sql` | `items` table with status enum, owner FK, image URL |
| 3 | `003_create_borrow_requests.sql` | `borrow_requests` table with status enum, FKs, lifecycle timestamps |
| 4 | `004_create_functions.sql` | Server-side PostgreSQL functions: `approve_request`, `confirm_pickup`, `submit_return`, `confirm_return` |
| 5 | `005_create_analytics_views.sql` | Materialized views for dashboard metrics (categories, campus activity) |
| 6 | `006_storage_policies.sql` | RLS policies for `item-images` bucket (owner upload, authenticated read) |
| 7 | `007_indexes.sql` | Performance indexes on FKs, status columns, search columns |

> **Important:** Run each migration separately. Verify success before proceeding to the next.

### 4.2 Seed Data (Optional, for Local/Demo)

- [ ] Run `server/seeds/seed.sql` in SQL Editor after all migrations
- [ ] Contains demo student accounts, sample listings, and borrow requests

### 4.3 Verify Core Tables

After migrations, confirm these tables exist with correct structure:

```sql
-- In Supabase SQL Editor
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'items', 'borrow_requests')
ORDER BY table_name, ordinal_position;
```

---

## 5. Local Environment Configuration

### 5.1 Create `server/.env`

- [ ] Copy `server/.env.example` → `server/.env`
- [ ] Fill in the four required values:

| Variable | Source | Example |
|----------|--------|---------|
| `PORT` | Local preference | `3000` |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Project API keys → anon | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Project API keys → service_role | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

- [ ] **Never commit** `server/.env` (already in `.gitignore`)

### 5.2 Install Server Dependencies

- [ ] `npm --prefix server install`
  - Installs `express`, `@supabase/supabase-js`, `zod`, `cors`, `dotenv`, `helmet`, `morgan`, `cookie-parser`
  - Dev dependencies: `nodemon`, `jest`, `supertest`

---

## 6. Verify Express Can Reach Supabase

After code is written (Phase 1 implementation):

- [ ] Start server: `npm --prefix server run dev`
- [ ] Open `http://localhost:3000/api/health`
- [ ] Expected response: `{ "status": "ok", "supabase": "connected" }` (or similar)
- [ ] If error, check:
  - `server/.env` has correct values
  - Supabase project is not paused
  - Network allows outbound HTTPS to Supabase

---

## 7. Restore Prototype Asset (Pre-existing)

- [ ] The file `assets/logo.png` is deleted in the working tree (see `git status`)
- [ ] Restore it: `git checkout HEAD -- assets/logo.png`
- [ ] Verify `docs/Guided_Website/index.html` loads the logo correctly

---

## 8. Branch & PR Setup (Team Workflow)

- [ ] Each task on branch: `feature/<task-id>-short-name` (e.g., `feature/1-express-setup`)
- [ ] Merge to `main` via Pull Request
- [ ] Keep credentials in ignored `.env` files; commit only `.env.example`

---

## Checklist Summary

| Phase | Manual Steps Required |
|-------|----------------------|
| **Supabase Project** | Create project, get URL/keys |
| **Auth** | Email domain allowlist (`@g.batstate-u.edu.ph`), email confirmation, customize template |
| **Storage** | Create `item-images` bucket, set size/MIME limits |
| **Database** | Run 7 migrations in order, optional seed |
| **Local Env** | Copy `.env.example` → `.env`, fill 4 values, `npm install` |
| **Verify** | `npm run dev` → `GET /api/health` succeeds |
| **Asset** | Restore `assets/logo.png` |

---

## References

- `STRUCTURE.md` — Full-stack folder layout and architecture boundaries
- `CONTEXT.md` — Project scope, data model, business rules, phased roadmap
- `docs/flows.md` — User interaction flows for validation
- `docs/IT_314_Guidelines_Final_Project_2026.md` — Course requirements and deadlines

---

**When all items above are checked:** The team can proceed to write Phase 1 Express API code (`server/src/`).  
Do NOT write any server or application code before this checklist is complete.