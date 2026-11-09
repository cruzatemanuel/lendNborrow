# lendNborrow — Official System & User Flows

lendNborrow is a peer-to-peer item lending platform designed exclusively for BatStateU students. Identity verification is automated through the student's institutional Google Workspace / GSuite email (`@g.batstate-u.edu.ph`). There are no administrator accounts or manual ID approval queues.

---

## Flow 1: Student Registration & Institutional GSuite Verification

**Actors:** Student, System  
**Preconditions:** Student possesses an official BatStateU GSuite email address (`@g.batstate-u.edu.ph`).

1. **Registration Form:** The student opens `register.html` and enters their institutional email, password, full name, student number, college, campus, and contact number.
2. **GSuite Domain Validation:**
   - **Frontend Check:** The form enforces that the email ends with `@g.batstate-u.edu.ph`.
   - **Backend Verification:** The Express API strictly validates `email.toLowerCase().endsWith('@g.batstate-u.edu.ph')`. Non-GSuite email addresses are rejected with a 400 Bad Request error.
3. **Account Creation:** The system creates the user in Supabase Auth and inserts a corresponding record in `profiles` with initial `verification_status = 'pending'`.
4. **Email Confirmation:** A confirmation email is dispatched to the student's institutional inbox.
5. **Account Activation:** When the student clicks the confirmation link, their email is verified and `verification_status` automatically transitions to `active`.
6. **Platform Access:** The verified student can now immediately create item listings, browse the catalog, and submit borrow requests.

---

## Flow 2: Standard Peer-to-Peer Lending and Borrowing Lifecycle (MVP)

**Actors:** Borrower (Active Student), Owner (Active Student), System  
**Preconditions:** Both students have `verification_status = 'active'`.

1. **Discovery:** The borrower navigates to `browse.html`, searches/filters items by category, condition, or campus, and selects an item to view `item.html`.
2. **Borrow Request:** The borrower opens the request modal, selects a start date and due date, adds an optional message, and submits. The request is created in `borrow_requests` with `status = 'pending'`.
3. **Owner Review:** The owner receives the request under `incoming-requests.html`. The owner reviews the borrower's profile, requested dates, and notes.
4. **Owner Decision:**
   - **Reject:** The owner rejects the request (with an optional rejection reason). The request status becomes `rejected`.
   - **Approve:** The owner approves the request. The request status transitions to `approved`.
5. **Automatic Mutual Exclusion:** Upon approval of one request, the transactional database function (`approve_request`) automatically transitions all other pending requests for the same item to `rejected` with the system reason: *"Another request was approved for this item"*.
6. **Handover & Pickup:** When the borrower meets the owner on campus and picks up the item:
   - The owner confirms handover (`confirm_pickup`).
   - Request status transitions to `borrowing` and `picked_up_at` timestamp is recorded.
   - Item status transitions from `available` to `borrowed`.
7. **Return Submission:** When the borrowing period concludes, the borrower navigates to `borrowed.html`, clicks "Submit Return", reports the item condition, and hands over the item (`submit_return`). The request status transitions to `return_submitted`.
8. **Owner Return Confirmation:** The owner inspects the returned item under `incoming-requests.html` and confirms receipt (`confirm_return`):
   - Request status transitions to `returned` and `returned_at` timestamp is recorded.
   - Item status transitions back from `borrowed` to `available`.

---

## Flow 3: Borrower Request Cancellation & Rejection

**Actors:** Borrower, Owner, System  
**Preconditions:** Borrow request is in `pending` status.

1. **Borrower Cancellation:**
   - The borrower navigates to `my-requests.html`.
   - The borrower locates their pending request and clicks "Cancel Request".
   - The system updates the request status to `cancelled`. The item remains `available` for other students.
2. **Owner Rejection:**
   - If the owner cannot lend the item (e.g. scheduling conflict), the owner clicks "Reject" on `incoming-requests.html` and optionally supplies a reason.
   - The request status updates to `rejected`.

---

## Flow 4: Student Dashboard & Personal Activity Tracking

**Actors:** Student, System  
**Preconditions:** Student is logged in.

1. **Dashboard Access:** The student visits `dashboard.html`.
2. **Personal Summary Cards:**
   - Active Listings count
   - Items Currently Borrowed count
   - Pending Requests awaiting response (both incoming and outgoing)
   - Completed Returns count
3. **Quick Action Shortcuts:** Quick links to "Add an Item", "Browse Catalog", "Incoming Requests", and "Borrowed Items".
4. **Recent Activity Stream:** Chronological feed of recent request status updates, pickups, and return confirmations.

---

## Flow 5: Late, Damaged, or Lost Return (Phase 6 Stretch)

**Actors:** Borrower, Owner, System  
**Preconditions:** Request is in `borrowing` status; return date has elapsed or item sustains damage/loss.

1. **Overdue Flagging:** If `CURRENT_DATE > due_date` and the item has not been returned, the request is flagged as overdue in dashboard cards and listings.
2. **Condition Recording:** During return inspection, the owner records condition as `fair`, `poor`, or marks the item as `lost`.
3. **Status Transition:**
   - Request transitions to `returned`.
   - If the item is marked `lost`, item status transitions to `lost` (not returned to `available`).
4. **Credit Score Impact:** Automated credit score deduction is calculated based on penalty rules (e.g., late return or condition drop).
5. **Compensation Claim:** If replacement or repair is required, a record is inserted into `compensations` with `request_id`, `borrower_id`, `reason`, and owner-specified `amount` (`paid = false`).
6. **Settlement:** Once the borrower compensates the owner, the owner marks the compensation as `paid = true`.
