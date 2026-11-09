# lendNborrow — Official Project Context

## Project Summary

lendNborrow is a community item lending and borrowing platform for BatStateU students. Students verify their institutional identity using their official BatStateU GSuite account (`@g.batstate-u.edu.ph`). Verified students can list items, browse listings, request to borrow, track returns, and view their personal lending activity. There are no administrator accounts or manual ID approval queues; verification is automated via institutional GSuite email validation.

The visual and interaction reference is `docs/Guided_Website/`. It is a prototype reference only; do not copy its `localStorage`, `innerHTML`, or fake API implementation into the production system.

## Official Stack

| Layer          | Technology                                         | Responsibility                                                           |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Frontend       | Plain HTML, CSS, and vanilla JavaScript ES modules | Multi-page UI, accessibility, responsive layout, calls to `/api`         |
| Backend        | Node.js and Express                                | REST API, authorization, validation, business rules, serves the frontend |
| Database       | Supabase Postgres                                  | Persistent application data, SQL functions, indexes, analytics views     |
| Authentication | Supabase Auth                                      | Email/password users and authenticated server-side sessions              |
| Storage        | Supabase Storage                                   | Item images                                                              |
| Charts         | Chart.js CDN                                       | Dashboard charts                                                         |

The browser must communicate with Express only. Supabase URL, anon key, and service-role key belong in server environment variables; never put any secret in frontend JavaScript. `js/config.js` exports the API base path only. One Express application serves the student pages, static assets, and every API route.

### Module Responsibilities

Matching filenames in `js/` and `server/src/` are not duplicates. The browser-side modules (`js/auth.js`, `js/items.js`, `js/requests.js`, and `js/analytics.js`) only call Express through `js/api.js` and update the UI. Server route modules with the same domain name validate requests and coordinate Supabase operations. `server/src/middleware/auth.js` verifies the session and student identity before a protected route runs. No frontend module imports Supabase or server code.

## Product Scope

### MVP

- Email/password registration and login restricted strictly to BatStateU GSuite accounts (`@g.batstate-u.edu.ph`)
- Automated verification via GSuite institutional email domain check and email confirmation (no manual admin approval)
- Student profile: full name, student number, college, campus, and contact details
- Item listing creation, image upload, editing, deletion, availability control, search, filters, and detail pages
- Borrow request, owner approval/rejection, pickup, return submission, and owner confirmation
- Student dashboard with personal lending stats (active listings, borrowed items, pending requests, completed returns)
- Responsive UI, loading, empty, validation, and error states

### Stretch Features

- Messaging and notifications
- Google OAuth sign-in (restricted to `@g.batstate-u.edu.ph`)
- Ratings and return photos
- Automated credit-score rules, overdue handling, compensation, and borrowing history

## Business Rules

### Institutional Verification & Access

- Single role: `student` (all participants are peer students).
- Verification is automated:
  - Registration rejects any email that does not end in `@g.batstate-u.edu.ph`.
  - Upon email confirmation via Supabase Auth, `verification_status` is `active`.
  - Non-GSuite emails cannot be registered.
- Only active verified students can create listings or submit borrowing requests.
- No administrator accounts, admin login, or manual verification review queues.

### Borrowing lifecycle

`pending → approved → borrowing → return_submitted → returned`

- A borrower may cancel a `pending` request.
- An owner may reject a `pending` request.
- Approving one request rejects other pending requests for that item.
- Pickup moves an approved request to `borrowing` and the item to `borrowed`.
- Owner return confirmation moves the request to `returned`; the item becomes `available` unless it was lost.

### Deferred credit and compensation rules

- Credit score uses a 0–5 scale if the stretch feature is approved.
- Exact on-time, late, damaged, and lost score adjustments must be agreed before implementation.
- Compensation and account locking are Phase 6 stretch features and are not MVP acceptance criteria.

## Data Model

**profiles** — `id`, `full_name`, `student_number`, `college`, `campus`, `contact`, `verification_status` (`pending`, `active`, `suspended`), `avatar_url`, `created_at`, `updated_at`

**items** — `id`, `owner_id`, `title`, `description`, `category`, `condition`, `image_url`, `status` (`available`, `borrowed`, `unavailable`, `lost`), `created_at`, `updated_at`

**borrow_requests** — `id`, `item_id`, `borrower_id`, `owner_id`, `status`, `start_date`, `due_date`, `picked_up_at`, `return_submitted_at`, `returned_at`, `return_condition`, `message`, `rejection_reason`, `created_at`, `updated_at`

**compensations** — `id`, `request_id`, `borrower_id`, `reason`, `amount`, `paid`, `paid_at`, `created_at` (Phase 6 stretch)

**messages** and **notifications** are stretch tables; create them only when their corresponding features are approved.

## Analytics & Dashboard

- Personal overview cards: active listings, items on loan, pending requests, completed returns.
- Recent borrowing and lending activity timeline.
- Top borrowed categories and campus activity for community insight.

## API Direction

- `/api/auth/*` — registration (with `@g.batstate-u.edu.ph` enforcement), login, logout, session, profile
- `/api/items/*` — listings, images, browsing, item detail
- `/api/requests/*` — create, approve, reject, cancel, pickup, return
- `/api/analytics/*` — student dashboard summaries and personal metrics

Compensation endpoints are added only in Phase 6 if that stretch feature is approved.

Every protected route verifies the authenticated student and checks item/request ownership on the server. SQL functions handle transactional actions such as approval and return confirmation.

Compensation endpoints are added only in Phase 6 if that stretch feature is approved.

Every protected route verifies the authenticated user and checks ownership or role on the server. SQL functions handle transactional actions such as approval and return confirmation.

## Revised Development Phases

### Phase 0.5 — Scope and UI Specification

Freeze the sitemap, MVP/stretch feature matrix, roles, statuses, data fields, credit rules, API contract, and responsive wireframes. Extract the maroon/gold design tokens and reusable UI patterns from `docs/Guided_Website/` without copying its code.

**Done when:** the team has approved this document, Flow A/Flow B, and the revised wireframes.

### Phase 1 — Express API and Database

Set up Node/Express, server environment configuration, Supabase project, schemas, migrations, indexes, Storage buckets, seed data, server-side Supabase client, authentication middleware, and an `/api/health` smoke test.

**Done when:** Express can securely read seeded data from Supabase through an API endpoint.

### Phase 2 — Authentication and GSuite Verification

Build registration with `@g.batstate-u.edu.ph` email domain validation, email verification handling, login, session management, profile editing, and verification status protection.

**Done when:** a student can register with a valid BatStateU GSuite email, confirm their account, and access lending and borrowing functionality. Non-GSuite emails are rejected.

### Phase 3 — Listings and Browsing

Build item creation, upload, edit/delete, availability, browse/search/filter/sort, and item-detail pages.

**Done when:** an active student can manage listings and another active student can find an available item.

### Phase 4 — Borrowing and Returns

Build requests, approvals, rejection/cancellation, pickup, active-borrow tracking, return submission, and return confirmation.

**Done when:** two accounts can complete the full lending lifecycle with correct status and ownership checks.

### Phase 5 — Dashboards and Personal Analytics

Build the student dashboard, activity summary cards, borrowing history, and personal metrics with Chart.js visualizations.

**Done when:** dashboard metrics match active listings, current borrows, and completed return records accurately.

### Phase 6 — Stretch Features

Implement messaging, notifications, appeals, account locking, Google authentication, ratings, return photos, automated credit rules, overdue handling, compensation, or borrowing history only after the MVP passes end-to-end testing.

### Phase 7 — QA, Deployment, and Demo

Test desktop and mobile layouts, role and ownership security, error paths, the full lending workflow, and production deployment. Prepare demo accounts, sample data, screenshots, documentation, and the presentation.

**Done when:** the deployed website is stable and the team can demonstrate the complete MVP within 10 minutes.

## Working Agreement

- Use branches named `feature/<task-id>-short-name` and merge to `main` through pull requests.
- Keep credentials in ignored `.env` files; commit only `.env.example` files.
- Test each task before review and preserve unrelated worktree changes.
- Run the frontend through Express or another local HTTP server; do not open HTML files with `file://`.

## Context Block for Future Tasks

```
Project: lendNborrow, a BatStateU community item lending/borrowing web app.
Official stack: plain HTML/CSS/vanilla JavaScript ES modules frontend, Node/Express REST API,
Supabase Postgres/Auth/Storage, and Chart.js CDN. The browser calls Express only at /api.
Reference UI: docs/Guided_Website/ is visual/interaction reference only; do not copy its localStorage,
innerHTML, or fake API implementation.
Rules: use textContent for user text; keep Supabase credentials server-side; make only the files needed.
Task: <one specific task>
```
