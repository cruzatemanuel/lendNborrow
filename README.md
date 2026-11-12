# lendNborrow

A peer-to-peer item lending and borrowing web application designed specifically for BatStateU Alangilan students. Students verify their institutional identity using their official university GSuite account (`@g.batstate-u.edu.ph`). Verified students can list academic tools and equipment, request to borrow items, manage campus handovers, track returns, and view personal and community lending analytics.

---

## 🛠️ Stack & Architecture

- **Frontend:** Plain HTML, CSS, and vanilla JavaScript ES modules (no frameworks, no build step).
- **Backend:** Node.js + Express REST API (serves static client pages and handles `/api/*`).
- **Database & Auth:** Supabase Postgres, Supabase Auth (institutional email verification), and Supabase Storage (`item-images`).
- **Visualizations:** Chart.js (via CDN) for Business Analytics (BA) track insights.
- **Security:** HttpOnly cookies for session storage; service-role key kept server-side; strict domain validation.

The browser communicates exclusively with Express at `/api`. It never talks directly to Supabase and holds no API secrets.

---

## 📋 Setup & Manual Configuration

All manual configuration steps (Supabase project setup, email whitelist, storage bucket, database migrations, and environment variables) are documented in the setup contract:

👉 **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)**

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm --prefix server install
```

### 2. Configure Environment

Copy `server/.env.example` to `server/.env` and supply your Supabase credentials:

```bash
cp server/.env.example server/.env
```

### 3. Apply Migrations & Seed Demo Data

In your Supabase SQL Editor, run:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_functions.sql`

Then run the seed script to create demo users and sample listings:

```bash
npm --prefix server run seed
```

### 4. Start the Application

```bash
# From repository root:
npm start

# OR using prefix:
npm --prefix server run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 👥 Demo Accounts

The seed script creates three verified student accounts with the password defined in `SEED_DEMO_PASSWORD` (default: `CHANGE_ME_DEMO_PASSWORD`):

| Email                       | Full Name      | College | Role in Demo        |
| --------------------------- | -------------- | ------- | ------------------- |
| `demo1@g.batstate-u.edu.ph` | Juan Dela Cruz | CICS    | Item Owner (Lender) |
| `demo2@g.batstate-u.edu.ph` | Maria Santos   | CEAFA   | Item Borrower       |
| `demo3@g.batstate-u.edu.ph` | Paolo Reyes    | CIT     | Peer Student        |

---

## 🧪 Automated Smoke Test

To verify the complete lending lifecycle against a running server with valid credentials:

```bash
npm --prefix server run smoke
```

---

## ⏱️ 10-Minute Presentation Demo Flow

1. **Landing & Identity Verification:** Open `http://localhost:3000`. Show the institutional GSuite domain restriction (`@g.batstate-u.edu.ph`).
2. **Catalog Browsing:** Browse items with search, category filtering, and condition badges.
3. **Borrow Request:** Sign in as `demo2@g.batstate-u.edu.ph` and request to borrow an item listed by `demo1`.
4. **Owner Review & Mutual Exclusion:** Sign in as `demo1@g.batstate-u.edu.ph` under `my-listings.html`. Approve the request; any other pending requests for the same item are automatically rejected.
5. **Campus Handover:** Confirm physical pickup (`status: borrowing`). Item changes to `borrowed`.
6. **Return Submission:** Borrower (`demo2`) navigates to `my-borrows.html` and clicks "Return Item" (`status: return_submitted`).
7. **Inspection & Return Confirmation:** Owner (`demo1`) confirms receipt on `return.html` with a condition rating (`status: returned`). Item automatically returns to `available`.
8. **Business Analytics Dashboard:** View personal summary stat cards, recent activity stream, and community chart visualizations (top categories and borrowing activity by college).
