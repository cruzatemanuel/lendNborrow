# lendNborrow

A peer-to-peer item lending and borrowing web application for BatStateU Alangilan students. Students verify their institutional identity using their official university GSuite account (`@g.batstate-u.edu.ph`). Verified students can list academic tools and equipment, filter listings by category and college, request to borrow items, manage campus handovers, track returns, and view personal and campus lending analytics.

🔗 - https://lendnborrow.onrender.com/

---

## Stack & Architecture

- **Frontend:** Plain HTML, CSS, and vanilla JavaScript ES modules (no frameworks, no build step).
- **Backend:** Node.js + Express REST API (serves static client pages and handles `/api/*`).
- **Database & Auth:** Supabase Postgres, Supabase Auth (institutional email verification), and Supabase Storage (`item-images`).
- **Visualizations:** Chart.js (via CDN) for dashboard analytics (**Top Items by Category** and **Borrowing Activity by College**).
- **Security:** HttpOnly cookies for session storage; service-role key kept server-side; strict `@g.batstate-u.edu.ph` domain validation.

The browser communicates exclusively with Express at `/api`. It never talks directly to Supabase and holds no API secrets.

---

## Setup & Manual Configuration

All manual configuration steps (Supabase project setup, email whitelist, storage bucket, database migrations, and environment variables) are documented in:

- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)**

---

## Quick Start Guide

### 1. Install Dependencies

```bash
npm --prefix server install
```

### 2. Configure Environment

Copy `server/.env.example` to `server/.env` and supply your Supabase credentials:

```bash
cp server/.env.example server/.env
```

### 3. Apply Database Migrations

In your Supabase SQL Editor, run:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_functions.sql`

If your database previously contained test or seeded demo rows, run `cleanup_demo_data.sql` in the Supabase SQL Editor to remove them cleanly without affecting schema constraints or RLS policies.

### 4. Start the Application

```bash
# From repository root:
npm start

# OR using prefix:
npm --prefix server run dev
```

Open your browser to: **`http://localhost:3000`**

---

## API Verification

To verify server health, domain enforcement, catalog browsing, and analytics endpoints against a running server:

```bash
npm --prefix server run smoke
```

---

## Core Student Workflow

1. **Registration & Verification:** Register with an official BatStateU GSuite email (`@g.batstate-u.edu.ph`) and confirm via the verification link sent to your inbox.
2. **Catalog Browsing:** Search and filter items by keyword, category, college, and availability on `browse.html`.
3. **List an Item:** Post calculators, drafting tools, lab gear, or books on `listing-form.html` with a photo, maximum borrow duration, and campus pickup location.
4. **Borrow Request:** Request to borrow an available item on `item.html` with pickup and return dates.
5. **Owner Review & Mutual Exclusion:** Review incoming requests on `my-listings.html`. Approving one request automatically declines competing pending requests for that item.
6. **Campus Handover:** Confirm physical pickup (`status: borrowing`), which marks the item as `borrowed`.
7. **Return Submission & Confirmation:** The borrower submits a return on `my-borrows.html` (`status: return_submitted`), and the owner confirms the returned item's condition on `return.html` (`status: returned`), restoring the item to `available`.
8. **Student Dashboard:** View personal summary cards, recent borrowing history, activity feed, and the two live campus charts (**Top Items by Category** and **Borrowing Activity by College**).
