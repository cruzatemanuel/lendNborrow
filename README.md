# lendNborrow — Project Working Doc

**Course:** IT 314 Web System and Technologies — Final Project 2026
**Presentation window:** Dec 1–5, 2026 (face-to-face, max 10 min, formal attire, live demo, all members present)
**Submission:** Google Sheet entries complete by **Dec 5** → our internal target: **Dec 4**
**Last updated:** Oct 2, 2026

---

## 0. Project Summary

**Title:** lendNborrow

lendNborrow is a web-based platform that allows users to lend and borrow items within their community. Users can list items such as books, tools, and equipment, while other users can browse available items and send borrowing requests. The platform aims to make sharing resources more convenient, accessible, and organized.

**Objectives → MVP coverage**

| Objective | Covered by |
|---|---|
| Provide a platform where users can list items they are willing to lend | Item listing CRUD with photo |
| Allow users to easily browse and search for available items | Browse, search, filter, item detail |
| Enable users to send and manage borrowing requests | Borrow request flow (request, approve/decline) |
| Help users organize and keep track of borrowed and returned items | Status tracking, "My items", "My borrowings", overdue |
| Encourage resource sharing within the community | Community/area field + filter, notifications, dashboard stats |

---

## 1. Team and Roles

| Role | Member | Owns |
|---|---|---|
| A — Backend & DB | _[name]_ | Node/Express, schema, auth, APIs, deployment |
| B — Frontend | _[name]_ | Pages, JS, API integration, responsiveness |
| C — UX, Analytics & QA | _[name]_ | Wireframes, design system, dashboard/charts, seed data, testing, docs, deck |

**Rules**
- Every PR is reviewed by someone other than the author.
- Everyone must be able to explain every part of the system (all present at defense).
- Main branch always deployable after Oct 18.

---

## 2. Scope

### MVP (must ship)
- [ ] Register / login (user profile includes a community/area, e.g. campus, barangay or org)
- [ ] Item listing CRUD with photo
- [ ] Browse, search, filter by category and community/area
- [ ] Item detail page
- [ ] Borrow request flow: pending → approved / declined → borrowed → returned (+ overdue)
- [ ] "My items" and "My borrowings" pages
- [ ] In-app notifications
- [ ] Admin analytics dashboard (BA-track requirement)
- [ ] Responsive on phone / tablet / desktop
- [ ] Deployed on a public URL

### Stretch (only if ahead at Nov 15)
- [ ] User ratings
- [ ] Message thread per request
- [ ] Email notifications
- [ ] Map / location filter

### Dashboard targets (cut to 3 if behind)
- [ ] Most borrowed items
- [ ] Category breakdown
- [ ] Overdue rate
- [ ] Active users
- [ ] Monthly activity
- [ ] Average borrow duration

---

## 3. Key Dates

| Date | Milestone |
|---|---|
| Oct 7 | Confirm topic approval is on record; note the approval date for the sheet |
| Oct 11 | Wireframes, ERD, API contract done |
| Oct 18 | Login working on a public URL |
| **Oct 19–23** | **Midterms — no scheduled dev** |
| Oct 24 | 1-hr team sync |
| Nov 1 | Browse / search working on deployed build |
| Nov 8 | Full borrow request flow working |
| **Nov 15** | **Feature freeze** |
| **Nov 22** | **Code freeze** (bug fixes only) |
| Nov 29 | Presentation-ready |
| Nov 30 | Buffer (holiday) — backup demo ready |
| Dec 1–5 | Presentation (confirm slot) |
| Dec 4 | Submit to Google Sheet |

> ⚠️ **Open:** Final exam dates not yet known. If finals fall in Nov 23–Dec 5, move feature freeze to Nov 8 and code freeze to Nov 15.

---

## 4. Phase Plan

### Phase 1 — Planning & early build (Oct 2–11)
- [ ] Group agrees on roles and scope
- [x] Title and topic decided: lendNborrow
- [ ] Confirm facilitator approval and record the approval date (the sheet asks for it); if not yet approved, get it by Oct 7
- [ ] **A:** Express scaffold, DB schema draft
- [ ] **B:** Repo structure, shared layout, branching rules
- [ ] **C:** Wireframes for main pages, design system (colors, type, components)
- [ ] ERD finalized
- [ ] API endpoint list finalized
- [ ] Decisions locked (see §6): DB, image storage, request status transitions
- [ ] Project board created

### Phase 2 — Foundation & first deploy (Oct 12–18, reduced pace)
- [ ] **A:** Register/login, item model + endpoints, deploy skeleton
- [ ] **B:** Login/register pages, navbar
- [ ] **C:** Seed data (30+ realistic items), request state-transition rules written
- [ ] Login works on public URL

### Midterm break (Oct 19–23)
- Nothing scheduled.

### Phase 3 — Listings, browse, search (Oct 24–Nov 1)
- [ ] Oct 24 sync + task reassignment
- [ ] **A:** Finish item CRUD, image upload, search/filter/pagination
- [ ] **B:** Add/edit item form, item cards, browse page, detail page
- [ ] **C:** Usability check on first screens, start dashboard queries
- [ ] Add → browse → search → view works on deployed build

### Phase 4 — Borrow request workflow (Nov 2–8; Nov 1–2 long weekend)
- [ ] **A:** Request endpoints, status state machine, block overlapping approved requests per item
- [ ] **B:** Request form, lender approval screen, "My borrowings"
- [ ] **C:** Edge-case tests: duplicate requests, borrowing own item, past dates
- [ ] Full request goes pending → approved on deployed build

### Phase 5 — Returns, notifications, dashboard v1 (Nov 9–15)
- [ ] **A:** Return confirmation, overdue logic, notification endpoints
- [ ] **B:** Notification UI, status badges
- [ ] **C:** Admin dashboard v1
- [ ] **Feature freeze Nov 15**

### Phase 6 — Integration & polish (Nov 16–22)
- [ ] **A:** Validation, error handling, security basics (password hashing, input checks, auth guards), query performance
- [ ] **B:** Responsiveness (phone/tablet/desktop), loading and empty states
- [ ] **C:** Finish dashboard, full test pass, bug log
- [ ] **Code freeze Nov 22**

### Phase 7 — Testing & presentation prep (Nov 23–29)
- [ ] 3–5 outside testers use the live site; log and fix issues
- [ ] Final seed data
- [ ] README, setup guide, feature list, screenshots, ERD
- [ ] Deck + 10-min script (intro → overview → functionality → dev process)
- [ ] 2+ timed rehearsals in formal attire
- [ ] Backup: screen recording + local copy running

### Phase 8 — Presentation & submission (Dec 1–5)
- [ ] Confirm presentation slot
- [ ] Present
- [ ] Fill Google Sheet: section workbook, group number, member names, topic approval date, submission date, project title, documentation links
- [ ] Submit by Dec 4

---

## 5. Weekly Rhythm

- **Mon:** 20-min planning, assign tasks on the board
- **Wed:** async blocker check-in
- **Fri/Sat:** merge to main, deploy, short demo to each other

---

## 6. Decision Log

| Decision | Choice | Date | Notes |
|---|---|---|---|
| Database | _TBD (PostgreSQL or MySQL suggested — relational fits requests/dates/aggregates)_ | | |
| Image storage | _TBD (use cloud/object storage; deployed server disks are often ephemeral)_ | | |
| Auth method | _TBD (JWT vs session)_ | | |
| Hosting | _TBD_ | | |
| Charting library | _TBD (e.g., Chart.js)_ | | |
| Request statuses & allowed transitions | _TBD — write down before coding_ | | |

---

## 7. Risk Register

| Risk | Mitigation | Owner |
|---|---|---|
| Midterms eat Oct 12–18 | Push first deploy to Oct 24–25 and tighten Oct 26–Nov 1 | All |
| Finals overlap prep/presentation | Get dates; move freezes earlier if needed | All |
| Late deployment surprises (env vars, uploads) | Deploy skeleton by Oct 18 | A |
| Request state machine bugs | Write transitions in Week 1; C writes edge-case tests | A / C |
| Uneven workload | C owns seed data, dashboard SQL, API tests early | C |
| Demo failure | Seeded stable data, test on venue network/hotspot, screen-recording fallback | All |

---

## 8. Weekly Log

### Week of Oct 5
- Done:
- Blocked:
- Next:

### Week of Oct 12
- Done:
- Blocked:
- Next:

### Week of Oct 26
- Done:
- Blocked:
- Next:

_(copy this block each week)_

---

## 9. Bug Log

| # | Description | Found by | Owner | Status |
|---|---|---|---|---|
| | | | | |

---

## 10. Final Submission Checklist

- [ ] Final project folder complete
- [ ] README with setup and run instructions
- [ ] Documentation (features, ERD, screenshots)
- [ ] Live URL works
- [ ] Google Sheet row filled in completely
- [ ] Formal attire ready for all members
- [ ] Backup demo ready
