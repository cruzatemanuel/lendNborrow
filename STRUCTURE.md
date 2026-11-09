# lendNborrow Full-Stack Folder Structure

## Overview

This structure separates frontend assets from backend logic and enforces the architecture rule: **the browser must communicate ONLY with Express at `/api`. Supabase credentials stay server-side.**

## Core Layout

```
lendNborrow/
├── server/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/           # Registration, login, session, profile routes
│   │   │   ├── items/          # Listing CRUD, images, search
│   │   │   ├── requests/       # Borrow lifecycle routes
│   │   │   └── analytics/      # Dashboard metrics and charts
│   │   ├── middleware/         # Session validation and student identity
│   │   ├── config/             # Express app setup, CORS, error handling
│   │   ├── supabase/           # Server-side Supabase client instance
│   │   ├── schemas/            # Zod/validators for request bodies and params
│   │   └── utils/              # Helper functions, mailers, storage helpers
│   ├── migrations/             # Supabase Postgres migration SQL files
│   ├── seeds/                  # Optional seed data (demo/local data)
│   ├── .env.example           # Environment variable template
│   ├── package.json
│   ├── package-lock.json
│   └── README.md              # Server setup, development, and deployment notes
├── docs/                      # Project documentation, guidelines, and UI reference
│   ├── Guided_Website/        # Visual/interaction reference (do NOT copy its implementation)
│   ├── flows.md               # User system flows
│   └── IT_314_Guidelines_Final_Project_2026.md
├── SETUP_CHECKLIST.md        # Manual setup tasks for Supabase and environment
├── README.md                 # Project overview and high-level setup
├── CONTEXT.md                # Project scope, data model, and roadmap (kept verbatim)
└── .gitignore
```

## Public Static Assets (Frontend)

```
lendNborrow/
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── assets/
        └── logo.png
```

**What goes in `public/`**
- User-facing static files that Express serves directly.
- Build outputs (compiled assets) would go here if using a build system.
- **NOT**: Server code, environment files, or database migrations.

## Backend Implementation Notes

### `server/src/api/`
- **`auth/`** → `/api/auth/*` (registration, login, logout, profile)
- **`items/`** → `/api/items/*` (listings, images, browsing, detail)
- **`requests/`** → `/api/requests/*` (create, approve, reject, cancel, pickup, return)
- **`analytics/`** → `/api/analytics/*` (dashboard summaries and personal metrics)

### `server/src/middleware/`
- **Auth middleware** verifies the session and enforces:
  - Only `@g.batstate-u.edu.ph` emails are allowed
  - Only `active` verified students can list or request
  - No administrator accounts; automated verification only
- Business rule checks (e.g., item ownership, request ownership, max active borrows, max listings)

### `server/src/supabase/`
- Only place for Supabase client configuration.
- Uses service-role key for privileged DB operations (admin functions, verifications).
- Uses anon key only if needed for client-side operations (not required per architecture rules).
- Read operations through server-side REST client or PostgreSQL functions.

### `server/src/schemas/`
- Centralized Zod schemas for:
  - Profile updates
  - Item creation/edit
  - Request creation (validation of pickup/return dates, max days)
  - Admin verification/rejection payloads

### `server/src/utils/`
- Upload helpers for item images (validate, resize, upload to Supabase Storage)
- Email/NOTIFICATION helpers (consider using Resend/Sesama/Postmark if adding stretch features)
- Validation helpers for student numbers, college/campus, etc.

## `docs/Guided_Website/` — Visual & Interaction Reference Only

- Do NOT copy `localStorage`, `innerHTML`, or fake API implementations.
- Extract UI patterns and design tokens, but implement real API calls in `js/` modules.
- The frontend `js/` modules should be plain ES modules calling `/api` endpoints and updating the DOM via standard APIs.

## File Placement Strategy

- **Frontend modules**: `public/js/` (e.g., `auth.js`, `items.js`, `requests.js`, `analytics.js`)
  - Import only native modules (fetch, template literals, DOM APIs, Chart.js CDN)
  - No Supabase or Express imports
- **Backend modules**: `server/src/`
  - All Express routes, middleware, validation, Supabase client, business logic
- **Database**: Supabase Postgres managed via SQL migrations (`server/migrations/`)
- **Assets**: Stored in Supabase Storage bucket `item-images`; frontend uploads to `/api/items/upload`
- **Configuration**: `.env.example` lives in `server/`

## Sample Frontend Entry Point

`public/index.html` references `app.js` → loads ES modules from `js/`:

```html
<script type="module" src="/js/app.js"></script>
<script type="module" src="/js/auth.js"></script>
<script type="module" src="/js/items.js"></script>
<script type="module" src="/js/requests.js"></script>
<script type="module" src="/js/analytics.js"></script>
```

`js/api.js` exports a configured fetch client:

```js
// public/js/api.js
export const API_BASE = '/api';
export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}
```

## gitignore

**`server/.env`** (never committed) is already excluded in `server/.gitignore` (part of the template in `server/.gitignore`). We'll ensure `server/.gitignore` is present and covers:
- `.env`
- `node_modules`
- `logs/`
- `.supabase/`

## Starting with `npm --prefix server run dev`

- `public/` is served statically by Express.
- Frontend `js/` modules live under `public/js/`.
- API routes serve `/api/*`.
- `/api/health` is an Express GET route returning basic status.
- Frontend code (`public/js/app.js`) bootstraps the app and initializes Chart.js from CDN.

## References

- `CONTEXT.md` — Project scope, phased roadmap, and architecture rules
- `docs/Guided_Website/` — Approved visual/interaction reference (do NOT copy implementation)
- `docs/flows.md` — User interaction flows for validation

## Boundaries

- Never expose Supabase credentials in `public/`.
- Do NOT import server-side modules (e.g., `express`, `supabase`) into `public/js/`.
- Do NOT duplicate the prototype's in-memory data model (`app.js` state machine) in production.
- All server-side logic belongs in `server/src/`.
- Do NOT put API route files in `public/` or `docs/`.

---

**Why this structure?**

- **Clear separation**: Frontend only knows about Express at `/api`.
- **Testable layers**: Backend code is importable, testable in isolation.
- **Documented**: Each folder has a clear purpose.
- **Scalable**: New phases (e.g., messaging, notifications) can be added in dedicated backend modules and UI components.
- **Beginner-friendly**: Mirrors the progression from prototype (`docs/Guided_Website/`) to implementation (`server/src/`) with minimal friction.
- **Production-ready**: Implements course requirements (GSuite domain check, automated verification, no admin roles) in the backend.
- **Convention**: Follows existing repo patterns where present (e.g., `src/api/` under `server/`) and extends them consistently.

---

**Next steps**

After you approve this structure and the `SETUP_CHECKLIST.md`, I can start writing the Express API skeleton (basic routes, middleware, and `/api/health`), then generate the first set of routes for Phase 1 (express setup) and Phase 2 (authentication and GSuite verification). The `SETUP_CHECKLIST.md` will guide you through Supabase project setup and environment configuration before any code can run.