# lendNborrow — Official Project Context

## Project Summary

lendNborrow is a community item lending and borrowing platform for BatStateU students. Verified students can list items, browse listings, request to borrow, track returns, and view their activity. Administrators verify student accounts and view platform analytics.

The visual and interaction reference is `docs/Guided_Website/`. It is a prototype reference only; do not copy its `localStorage`, `innerHTML`, or fake API implementation into the production system.

## Official Stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Plain HTML, CSS, and vanilla JavaScript ES modules | Multi-page UI, accessibility, responsive layout, calls to `/api` |
| Backend | Node.js and Express | REST API, authorization, validation, business rules, serves the frontend |
| Database | Supabase Postgres | Persistent application data, SQL functions, indexes, analytics views |
| Authentication | Supabase Auth | Email/password users and authenticated server-side sessions |
| Storage | Supabase Storage | Item images and student-ID images |
| Charts | Chart.js CDN | Dashboard charts |

The browser must communicate with Express only. Supabase URL, anon key, and service-role key belong in server environment variables; never put any secret in frontend JavaScript. `js/config.js` exports the API base path only.

## Architecture and File Structure

```
lendNborrow/
├── *.html
├── css/
│   ├── theme.css
│   └── styles.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── auth.js
│   ├── guard.js
│   ├── layout.js
│   ├── ui.js
│   ├── items.js
│   ├── requests.js
│   ├── analytics.js
│   └── pages/
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── .env.example
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── assets/
└── docs/
    ├── flows.md
    ├── Guided_Website/
    └── IT_314_Guidelines_Final_Project_2026.md
```

User-provided content must be rendered with DOM APIs and `textContent`; do not interpolate it into `innerHTML`.

## Product Scope

### MVP

- Email/password registration and login
- Student profile: full name, student number, college, campus, contact, and credit score
- Student-ID upload and admin approval, rejection, or resubmission
- Item listing creation, image upload, editing, deletion, availability control, search, filters, and detail pages
- Borrow request, owner approval/rejection, pickup, return submission, owner confirmation, overdue state, compensation, and history
- Student dashboard and admin analytics dashboard
- Responsive UI, loading, empty, validation, and error states

### Stretch Features

- Messaging and notifications
- Account appeals and account locking
- Google authentication
- Ratings and return photos

## Business Rules

### Roles and verification

- Roles: `student`, `admin`.
- Verification statuses: `new`, `pending`, `active`, `rejected`, `suspended`, `locked`.
- Only active students can create listings or submit borrowing requests.
- Administrators can review student-ID submissions and view platform analytics.

### Borrowing lifecycle

`pending → approved → borrowing → return_submitted → returned`

- A borrower may cancel a `pending` request.
- An owner may reject a `pending` request.
- Approving one request rejects other pending requests for that item.
- Pickup moves an approved request to `borrowing` and the item to `borrowed`.
- Owner return confirmation moves the request to `returned`; the item becomes `available` unless it was lost.
- An active request past its due date is overdue.

### Credit and compensation

- Credit is on a 0–5 scale; a new active student starts at 5.0.
- The exact on-time, late, damaged, and lost score adjustments must be defined as constants before implementing return logic.
- Damaged or lost returns create a compensation record; the owner sets the amount and can mark it paid.
- Account locking threshold and appeals remain stretch decisions until formally approved.

## Data Model

**profiles** — `id`, `role`, `full_name`, `student_number`, `college`, `campus`, `contact`, `credit_score`, `verification_status`, `id_image_url`, `avatar_url`, `created_at`, `updated_at`

**items** — `id`, `owner_id`, `title`, `description`, `category`, `condition`, `image_url`, `status` (`available`, `borrowed`, `unavailable`, `lost`), `created_at`, `updated_at`

**borrow_requests** — `id`, `item_id`, `borrower_id`, `owner_id`, `status`, `start_date`, `due_date`, `picked_up_at`, `return_submitted_at`, `returned_at`, `return_condition`, `message`, `rejection_reason`, `created_at`, `updated_at`

**compensations** — `id`, `request_id`, `borrower_id`, `reason`, `amount`, `paid`, `paid_at`, `created_at`

**messages** and **notifications** are stretch tables; create them only when their corresponding features are approved.

## Analytics

- Trending items: borrow count by item, top 5–10.
- College credit score: average `credit_score` and member count by college.
- Compensation payers: borrowers with compensation, paid amount, and paid percentage by college.
- Borrowing activity: requests over time.
- Summary cards: total active students, active listings, active borrows, and overdue borrows.

## API Direction

- `/api/auth/*` — registration, login, logout, session, profile
- `/api/admin/*` — verification queue, approve/reject, analytics
- `/api/items/*` — listings, images, browsing, item detail
- `/api/requests/*` — create, approve, reject, cancel, pickup, return, compensation
- `/api/analytics/*` — dashboard summaries and chart data

Every protected route verifies the authenticated user and checks ownership or role on the server. SQL functions handle transactional actions such as approval and return confirmation.

## Revised Development Phases

### Phase 0.5 — Scope and UI Specification

Freeze the sitemap, MVP/stretch feature matrix, roles, statuses, data fields, credit rules, API contract, and responsive wireframes. Extract the maroon/gold design tokens and reusable UI patterns from `docs/Guided_Website/` without copying its code.

**Done when:** the team has approved this document, Flow A/Flow B, and the revised wireframes.

### Phase 1 — Express API and Database

Set up Node/Express, server environment configuration, Supabase project, schemas, migrations, indexes, Storage buckets, seed data, server-side Supabase client, authentication middleware, and an `/api/health` smoke test.

**Done when:** Express can securely read seeded data from Supabase through an API endpoint.

### Phase 2 — Authentication and Verification

Build registration, login, session handling, profile editing, student-ID upload, verification-status views, and the admin approval/rejection workflow.

**Done when:** a student can register, submit verification, and access protected functionality only after approval.

### Phase 3 — Listings and Browsing

Build item creation, upload, edit/delete, availability, browse/search/filter/sort, and item-detail pages.

**Done when:** an active student can manage listings and another active student can find an available item.

### Phase 4 — Borrowing and Returns

Build requests, approvals, rejection/cancellation, pickup, active-borrow tracking, return submission, return confirmation, overdue states, credit updates, and compensation.

**Done when:** two accounts can complete the full lending lifecycle with correct status and ownership checks.

### Phase 5 — Dashboards and Analytics

Build the student dashboard, admin analytics endpoints, summary cards, SQL views, and Chart.js visualizations.

**Done when:** dashboard metrics match seeded and manually verified database data.

### Phase 6 — Stretch Features

Implement messaging, notifications, appeals, account locking, Google authentication, ratings, or return photos only after the MVP passes end-to-end testing.

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
