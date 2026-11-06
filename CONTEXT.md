# lendNborrow — Project Breakdown

> Built from what the group has shared so far. Items marked **(proposed)** are my suggestions and need group confirmation.

---

## 1. Project Summary

lendNborrow is a web-based platform that lets users lend and borrow items within their community. Users list items such as books, tools, and equipment; other users browse what's available and send borrowing requests. The goal is to make resource sharing more convenient, accessible, and organized. A business analytics layer adds insights such as trending items, credit scores by department, and compensation payment trends.

**Naming note:** the project appears as both "lendNborrow" and "linkNborrow." Pick one and use it everywhere (app title, README, presentation).

## 2. Course Context and Team

- **Course:** IT 314 — Web System and Technologies (WST), final project
- **Deliverable:** Website
- **Due:** December 1–5, 2026
- **Group:** Emanuel Cruzat, Mikayla Banaag, Lance Pria

This is a collaborative project: all three members work on every part and get to experience the full stack, with no fixed per-person roles. Suggestion: in each phase, every member takes at least one task, and the people on each task rotate between phases.yy

---

## 3. Objectives

1. Provide a platform where users can list items they are willing to lend.
2. Let users easily browse and search for available items.
3. Enable users to send and manage borrowing requests.
4. Help users organize and keep track of borrowed and returned items.
5. Encourage resource sharing within the community.
6. Give users and admins insight into borrowing activity through analytics.

---

## 4. Features

**Accounts and profiles**

- Register and log in with email and password
- Profile with name, department, and credit score
- Edit profile

**Item listings**

- Create a listing: title, description, category, condition, photo
- Edit and delete own listings
- Mark a listing available or unavailable
- "My Listings" page

**Browse and search**

- Browse all available items in a grid
- Search by title
- Filter by category, sort by newest or A–Z
- Item detail page with owner info

**Borrow requests**

- Send a request with dates and a message
- Owner approves or rejects
- Borrower can cancel a pending request
- "My Requests" (as borrower) and "Incoming Requests" (as owner)

**Tracking**

- Currently borrowed items with due dates
- Items lent out, with overdue indicators
- Owner marks an item as returned and records its condition
- Borrowing history

**Credit score and compensation**

- Credit score changes based on return behavior
- Compensation record created for damaged or lost items
- Owner marks compensation as paid

**Analytics dashboard**

- Trending items (most borrowed)
- Average credit score by department
- Compensation payers by department
- Borrowing activity over time
- Summary cards (total items, active borrows, overdue count, users)

**General**

- Responsive UI (phone, tablet, desktop)
- Loading, empty, and error states
- Clear success and error messages

---

## 5. Business Analytics Integration

Ideas from the group:

- **Trending items:** which items are borrowed the most.
- **Credit scores by department:** which departments have the highest credit scores.
- **Compensation payers:** the average number of users who pay compensation.

Metric definitions **(proposed, confirm)**:

| Metric                  | Definition                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Trending items          | Borrow count per item, top 5–10                                                                                          |
| Department credit score | Average `credit_score` of users grouped by department                                                                    |
| Compensation payers     | Per department: number of borrowers who paid compensation, and that number as a percentage of the department's borrowers |

---

## 6. Tech Stack

| Layer           | Choice                     | Notes                                             |
| --------------- | -------------------------- | ------------------------------------------------- |
| Frontend        | React + Vite               | Plain JavaScript (no TypeScript)                  |
| Routing         | React Router               | Protected routes for logged-in pages              |
| Styling         | Plain CSS (one theme file) | No component libraries                            |
| Database        | Supabase (Postgres)        | Views for analytics, functions for business logic |
| Auth            | Supabase Auth              | Email and password                                |
| Image storage   | Supabase Storage           | Bucket: `item-images`                             |
| Charts          | Recharts                   | Bar and line charts                               |
| Hosting         | Vercel or Netlify          | Deploy on push from GitHub                        |
| Version control | GitHub                     | Feature branches and pull requests                |
| Design          | Claude Design              | Wireframes from the Flow A / Flow B flowchart     |

**Decided:** React for the frontend. **To confirm:** Supabase as the backend (it was my recommendation; the group has not explicitly confirmed it).

**Keep it simple:** no Redux, no TypeScript, no UI component library. Fewer moving parts means fewer bugs in 3.5 weeks.

### Proposed Data Model

**profiles** — `id` (same as auth user id), `full_name`, `department`, `credit_score` (default 100), `created_at`

**items** — `id`, `owner_id`, `title`, `description`, `category`, `condition`, `image_url`, `status` (available / borrowed / unavailable), `created_at`

**borrow_requests** — `id`, `item_id`, `borrower_id`, `owner_id`, `status` (pending / approved / rejected / cancelled / returned), `start_date`, `due_date`, `returned_at`, `return_condition` (good / damaged / lost), `message`, `created_at`

**compensations** — `id`, `request_id`, `borrower_id`, `reason` (damaged / lost), `amount`, `paid` (boolean), `created_at`

Status flow: pending → approved → returned. An approved request means the item is currently borrowed. Adjust this to match your Flow A / Flow B.

### Proposed Credit Score Rules (confirm)

- Starts at 100
- On-time return: +5
- Late return: −10
- Damaged or lost: −20

---

## 7. Using This File with AI (Token-Saving Tips)

Each task below is small on purpose. Prompt **one task at a time**, not a whole phase.

Paste this short context block at the top of each new chat, then add the task:

```
Project: lendNborrow, a community item lending/borrowing web app (school project).
Stack: React + Vite, React Router, Supabase (Postgres, Auth, Storage), Recharts, plain CSS.
No TypeScript, no Redux, no UI libraries.
Tables: profiles, items, borrow_requests, compensations.
Task: <paste ONE task here, e.g. "3.4 Add Item page with form: title, description, category, condition">
Rules: give only the files and code needed for this task. No explanations unless I ask.
```

Tips:

- Include only the files the task touches, not the whole codebase.
- Start a fresh chat after each finished task or two.
- If something breaks, paste only the error message and the one relevant file.
- Always test a task before moving to the next one.

---

## 8. Development Phases

### Timeline Overview

| Phase | Name                                     | Dates                  |
| ----- | ---------------------------------------- | ---------------------- |
| 0     | Planning and Setup                       | Nov 5 – Nov 8          |
| 1     | Supabase and Data Model                  | Nov 8 – Nov 10         |
| 2     | Auth and Profile                         | Nov 10 – Nov 13        |
| 3     | Item Listings                            | Nov 13 – Nov 16        |
| 4     | Browse and Search                        | Nov 16 – Nov 18        |
| 5     | Borrow Requests                          | Nov 18 – Nov 21        |
| 6     | Tracking, Credit Score, and Compensation | Nov 21 – Nov 24        |
| 7     | Analytics Dashboard                      | Nov 24 – Nov 27        |
| 8     | UI Polish, Responsiveness, and QA        | Nov 27 – Nov 30        |
| 9     | Final Deploy, Docs, and Demo             | Dec 1 – Dec 5 (buffer) |

The plan aims to finish building by Nov 30, so Dec 1–5 is a safety buffer for deployment, fixes, and rehearsal. Dates are targets; adjust around your other classes.

---

### Phase 0 — Planning and Setup (Nov 5 – Nov 8)

**Goal:** everyone has the same working environment and a shared repo.

- 0.1 Decide the final project name and use it everywhere.
- 0.2 Create the GitHub repo and add all three members.
- 0.3 Agree on a branch workflow: work on `feature/<task-id>-short-name`, merge into `main` through pull requests.
- 0.4 Install Node (LTS) and Git on every member's machine; verify with `node -v` and `npm -v`.
- 0.5 Scaffold the app: `npm create vite@latest lendnborrow -- --template react`.
- 0.6 Install dependencies: `react-router-dom`, `@supabase/supabase-js`, `recharts`.
- 0.7 Create the folders: `src/pages`, `src/components`, `src/lib`, `src/hooks`, `src/context`, `src/styles`.
- 0.8 Add `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; add `.env` to `.gitignore`.
- 0.9 Every member clones the repo, runs `npm install` and `npm run dev`, and confirms the default page loads.
- 0.10 Write the route map: Home, Browse, Item Detail, Add Item, Edit Item, My Listings, My Requests, Incoming Requests, Borrowed/Lent Out, Dashboard, Login, Register, Profile, 404.
- 0.11 Finish the wireframes from the Flow A / Flow B flowchart in Claude Design and save screenshots in a `/docs` folder.
- 0.12 Write Flow A / Flow B as a short text list in `/docs/flows.md` so AI prompts can reference them.

**Done when:** all three can run the app locally and push a branch to GitHub.

---

### Phase 1 — Supabase and Data Model (Nov 8 – Nov 10)

**Goal:** backend ready, with tables, security rules, and test data.

- 1.1 Create the Supabase project and invite the other members.
- 1.2 Copy the project URL and anon key into each member's local `.env`.
- 1.3 In Supabase Auth settings, turn off email confirmation for development.
- 1.4 Create the `profiles` table.
- 1.5 Create a trigger that inserts a `profiles` row whenever a new user signs up.
- 1.6 Create the `items` table.
- 1.7 Create the `borrow_requests` table with a check constraint on `status`.
- 1.8 Create the `compensations` table.
- 1.9 Add foreign keys and indexes (`items.owner_id`, `borrow_requests.item_id`, `borrow_requests.status`).
- 1.10 Create the Storage bucket `item-images` with public read.
- 1.11 Enable Row Level Security on all four tables.
- 1.12 Policies for `profiles`: signed-in users can read; users can update only their own row.
- 1.13 Policies for `items`: anyone signed in can read; only the owner can insert, update, or delete.
- 1.14 Policies for `borrow_requests`: borrower and owner can read; borrower can insert; owner can update status.
- 1.15 Policies for `compensations`: borrower and owner can read; owner can update.
- 1.16 Storage policies: signed-in users can upload; owners can delete their own images.
- 1.17 Create 5–6 test accounts through Supabase Auth, spread across different departments.
- 1.18 Seed SQL: about 15 items and about 20 requests in varied statuses, so analytics have data later.
- 1.19 Create `src/lib/supabaseClient.js`.
- 1.20 Smoke test: fetch `items` in a temporary component and log the result.

**Done when:** the frontend can read seeded items from Supabase.

---

### Phase 2 — Auth and Profile (Nov 10 – Nov 13)

**Goal:** users can register, log in, stay logged in, and see their profile.

- 2.1 Create `AuthContext` that holds the session and the user's profile.
- 2.2 Create the `useAuth` hook.
- 2.3 Build the Register page UI: name, email, password, department dropdown.
- 2.4 Create the department list in `src/lib/constants.js` (list to be confirmed by the group).
- 2.5 Register logic: call `signUp`, then save `full_name` and `department` to the profile.
- 2.6 Build the Login page UI and logic.
- 2.7 Add a Logout button.
- 2.8 Create the `ProtectedRoute` component that redirects to `/login`.
- 2.9 Build the Navbar with different links for logged-in and logged-out users.
- 2.10 Build the Profile page showing name, department, and credit score.
- 2.11 Add edit profile (name, department).
- 2.12 Form validation and error messages: empty fields, short password, duplicate email.
- 2.13 Loading state while the session is being checked.
- 2.14 Test: register, log out, log in, refresh the page and stay logged in, protected route blocks logged-out users.

**Done when:** a new user can register, log in, and view their profile, and protected pages are blocked when logged out.

---

### Phase 3 — Item Listings (Nov 13 – Nov 16)

**Goal:** users can create and manage their own listings.

- 3.1 Create the My Listings page route.
- 3.2 Fetch and display the current user's items.
- 3.3 Build the `ItemCard` component (image, title, category, status badge).
- 3.4 Add the category list to `constants.js`.
- 3.5 Build the Add Item form: title, description, category, condition.
- 3.6 Add the image input with a preview.
- 3.7 Upload the image to Storage and get the public URL.
- 3.8 Insert the item row with `owner_id` and `image_url`.
- 3.9 Build the Edit Item page, prefilled with current values.
- 3.10 Allow replacing the image when editing.
- 3.11 Delete an item with a confirmation (block deletion if there is an approved, unreturned request).
- 3.12 Toggle an item between available and unavailable.
- 3.13 Empty state: "You haven't listed anything yet."
- 3.14 Validation: required fields, image type and size limit.
- 3.15 Test: add, edit, and delete an item, with and without an image.
- 3.16 First deployment to Vercel or Netlify with env variables, to catch hosting problems early.

**Done when:** a user can fully manage listings and the app is live on a public URL.

---

### Phase 4 — Browse and Search (Nov 16 – Nov 18)

**Goal:** users can find items and view their details.

- 4.1 Create the Browse page route.
- 4.2 Fetch items with status `available`, joined with the owner's name and department.
- 4.3 Display items in a responsive grid of `ItemCard`s.
- 4.4 Add a search bar that filters by title (case-insensitive).
- 4.5 Add a debounce so the search doesn't query on every keystroke.
- 4.6 Add a category filter dropdown.
- 4.7 Add sorting: newest first, A–Z.
- 4.8 Mark or hide the user's own items on the Browse page.
- 4.9 Build the Item Detail page: image, description, condition, owner, status.
- 4.10 Add a "Request to Borrow" button, hidden for the owner and disabled if the item is unavailable.
- 4.11 Add "Load more" (12 items at a time).
- 4.12 Add loading and "no results found" states.
- 4.13 Test: search, filter, sort, and open detail pages.

**Done when:** a user can search, filter, and open any available item.

---

### Phase 5 — Borrow Requests (Nov 18 – Nov 21)

**Goal:** the full request-and-approval flow works between two accounts.

- 5.1 Build the request form (modal or page): start date, return date, message.
- 5.2 Validate dates: return date after start date, no dates in the past.
- 5.3 Block duplicate pending requests for the same item by the same user.
- 5.4 Insert the request with status `pending`.
- 5.5 Build the My Requests page (borrower view) with status badges.
- 5.6 Add cancel for pending requests.
- 5.7 Build the Incoming Requests page (owner view), pending first.
- 5.8 Show borrower name, department, and credit score on each incoming request.
- 5.9 Create a Postgres function `approve_request(request_id)` that sets the request to `approved` and the item to `borrowed`.
- 5.10 Make `approve_request` also reject other pending requests for the same item.
- 5.11 Wire the Approve button to the function.
- 5.12 Add the Reject button with an optional reason.
- 5.13 Show a pending-request count badge in the Navbar.
- 5.14 Test with two accounts: request, approve, reject, cancel, and the auto-reject case.

**Done when:** two test accounts can complete request → approve and request → reject without errors.

---

### Phase 6 — Tracking, Credit Score, and Compensation (Nov 21 – Nov 24)

**Goal:** returns are tracked, and credit scores and compensation update automatically.

- 6.1 Build the borrower's "Borrowed Items" tab with due dates.
- 6.2 Build the owner's "Lent Out" tab.
- 6.3 Add an overdue indicator when `due_date` has passed and the item is not returned.
- 6.4 Add a "Mark as Returned" form for the owner: condition (good / damaged / lost).
- 6.5 Define the credit score rules as constants and in a short comment on the SQL function.
- 6.6 Create the Postgres function `mark_returned(request_id, condition)` that sets the request to `returned`, records `returned_at`, and sets the item back to `available` (unless lost).
- 6.7 In the same function, update the borrower's `credit_score` using the rules.
- 6.8 For damaged or lost returns, insert a `compensations` row with `paid = false`.
- 6.9 Let the owner enter the compensation amount.
- 6.10 Let the owner mark a compensation as paid.
- 6.11 Show compensation due on the borrower's My Requests page.
- 6.12 Build the borrowing history view (all past requests for a user).
- 6.13 Optional: block requests from users below a minimum credit score (decide as a group).
- 6.14 Test three returns: on time, late, and damaged. Verify score changes and the compensation row.

**Done when:** all three return scenarios update the credit score correctly and compensation records appear.

---

### Phase 7 — Analytics Dashboard (Nov 24 – Nov 27)

**Goal:** a dashboard showing the business analytics the group wants.

- 7.1 Create the Dashboard route (login required).
- 7.2 SQL view `v_trending_items`: item title, category, borrow count.
- 7.3 SQL view `v_department_credit`: department, average credit score, number of members.
- 7.4 SQL view `v_compensation_by_department`: department, borrowers, payers, percentage paid.
- 7.5 SQL view `v_borrows_over_time`: borrow count per week.
- 7.6 Grant read access on the views to authenticated users.
- 7.7 Create the `useDashboardData` hook that fetches all views.
- 7.8 Build summary cards: total items, active borrows, overdue count, total users.
- 7.9 Trending items bar chart (top 5–10).
- 7.10 Department credit score bar chart.
- 7.11 Compensation payers by department chart.
- 7.12 Borrows over time line chart.
- 7.13 Optional: category breakdown chart.
- 7.14 Add chart titles, axis labels, tooltips, and empty/loading states.
- 7.15 Add a one-line insight under each chart (for example, "Engineering has the highest average credit score").
- 7.16 Verify the chart numbers against manual SQL counts on the seed data.

**Done when:** the dashboard shows all required analytics and the numbers match the database.

---

### Phase 8 — UI Polish, Responsiveness, and QA (Nov 27 – Nov 30)

**Goal:** the site looks consistent, works on phones, and has been tested.

- 8.1 Create `src/styles/theme.css` with colors, fonts, and spacing variables.
- 8.2 Make buttons, inputs, and status badges consistent across all pages.
- 8.3 Make the Navbar responsive (hamburger menu on mobile).
- 8.4 Make grids responsive (1, 2, 3, then 4 columns).
- 8.5 Check at widths 375px, 768px, and 1280px in dev tools.
- 8.6 Build the Home page: hero, three-step "How it works", call to action, featured items.
- 8.7 Build the 404 page.
- 8.8 Add success and error toasts for all actions.
- 8.9 Add confirm dialogs for destructive actions (delete, reject, cancel).
- 8.10 Accessibility basics: image alt text, form labels, color contrast, keyboard focus.
- 8.11 Run the full QA checklist with two or more accounts; log bugs in GitHub Issues or a shared sheet.
- 8.12 Fix bugs in priority order: broken flows first, visual issues last.
- 8.13 Remove `console.log` calls and unused code.
- 8.14 Security check: with a second account, try editing another user's item and request. Confirm it is blocked.

**Done when:** no broken flows remain, and the site is usable at phone width.

---

### Phase 9 — Final Deploy, Docs, and Demo (Dec 1 – Dec 5, buffer)

**Goal:** a stable live site, documentation, and a rehearsed demo.

- 9.1 Run `npm run build` and fix any warnings.
- 9.2 Confirm env variables are set on the host, then redeploy.
- 9.3 Set the Supabase Auth site URL and redirect URLs to the deployed domain.
- 9.4 Smoke test the live site: register, login, image upload, a full request flow, and the dashboard.
- 9.5 Clean the demo data so the dashboard shows meaningful numbers.
- 9.6 Write the README: description, features, tech stack, setup steps, screenshots.
- 9.7 Write the demo script: register → list item → second account requests → approve → mark returned → dashboard.
- 9.8 Record a backup screen recording of the demo in case of internet problems.
- 9.9 Open the Supabase project the day before the demo to make sure it hasn't paused.
- 9.10 Rehearse the demo once with all three members presenting.
- 9.11 Submit according to your instructor's requirements.

**Done when:** the live site works end to end and everyone can present any part of it.

---

## 9. Risks

| Risk                                                   | Mitigation                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| React is new to some members                           | Keep components simple; pair up on the first page in each phase         |
| RLS policies block valid actions or allow invalid ones | Test every flow with two accounts (tasks 5.14, 8.14)                    |
| Supabase free project pauses from inactivity           | Open it regularly and the day before the demo                           |
| Scope creep from analytics ideas                       | Finish Phases 0–6 first; Phase 7 charts can be trimmed if time is short |
| Time lost to hosting issues                            | Deploy early (task 3.16)                                                |
| Demo fails due to internet                             | Keep a recorded backup (task 9.8)                                       |

---

## 10. Open Items

- Confirm Supabase as the backend
- Confirm with the instructor that React and a hosted backend are allowed for the final project
- Settle the project name (lendNborrow vs linkNborrow)
- Confirm the credit score rules and the compensation triggers
- Confirm the list of departments for the profile dropdown
- Confirm the status flow against Flow A / Flow B
- Confirm the wireframe status
- Decide whether to block low-credit users from borrowing (task 6.13)
