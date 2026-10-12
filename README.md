# lendNborrow — IT 314 Final Project Timeline 2026

**Project Period:** October 12 – December 5, 2026  
**Development Deadline:** November 29, 2026  
**Final Presentation and Submission:** December 1–5, 2026  
**Group Size:** 3 Members  
**Recommended Stack:** HTML, CSS, JavaScript, Node.js, Express.js, PostgreSQL, Git, and GitHub

## 1. Project Overview and Development Strategy

lendNborrow is a web-based community lending and borrowing platform where users can list items they are willing to lend, browse available items, submit borrowing requests, and track the status of borrowed items.

With approximately seven weeks available for development, your group should prioritize a **working, complete system over a large number of features**.

The goal is to have a fully functional website by November 22, finish testing and documentation by November 29, and reserve December 1–5 for the actual presentation and submission.

### Proposed development phases

| Phase | Dates | Main Objective |
|---|---|---|
| 1. Planning and Requirements | Oct 12–18 | Finalize the scope, requirements, and responsibilities. |
| 2. System Design | Oct 19–25 | Design the database, interface, and system architecture. |
| 3. Core Development | Oct 26–Nov 1 | Implement authentication and item management. |
| 4. Borrowing System | Nov 2–8 | Implement borrowing requests and request processing. |
| 5. Integration and Dashboards | Nov 9–15 | Connect the features and complete the user dashboards. |
| 6. Testing and Refinement | Nov 16–22 | Test functionality, responsiveness, and security. |
| 7. Finalization | Nov 23–29 | Fix remaining bugs, prepare documentation, and rehearse. |
| 8. Presentation and Submission | Dec 1–5 | Demonstrate and submit the completed project. |

**Important:** Although the guideline identifies December 1–5 as the project duration, your group should complete development beforehand. Do not depend on those final five days to build essential features.

---

## 2. Group Roles and Responsibilities

Since your group has exactly three members, each person should have a primary responsibility while contributing to the overall development process.

The following assignments divide the work into backend development, frontend development, and system integration.

### Member 1 — Backend and Database Developer

**Primary responsibility:** Build the server, API, database, and core system logic.

Tasks:
- Set up Node.js and Express.js.
- Configure the PostgreSQL database.
- Design and implement database tables.
- Implement user registration and login endpoints.
- Implement item management endpoints.
- Implement borrowing request endpoints.
- Add server-side validation and access controls.
- Implement borrowing status transitions.
- Help debug backend and database problems.

**Main deliverables:**
- Working Express.js server.
- Connected PostgreSQL database.
- Authentication API.
- Item management API.
- Borrowing request API.
- Database schema and setup instructions.

### Member 2 — Frontend and UI/UX Developer

**Primary responsibility:** Design and implement the website interface.

Tasks:
- Create wireframes and interface layouts.
- Establish the website's colors, typography, spacing, and components.
- Develop the landing page.
- Develop registration and login pages.
- Develop the item browsing and search interface.
- Develop item details and item listing forms.
- Make the website responsive.
- Implement client-side form validation.
- Improve navigation and user experience.

**Main deliverables:**
- Responsive website layout.
- Authentication pages.
- Item browsing and search pages.
- Item details and listing forms.
- Reusable interface components.
- Consistent visual design across the website.

### Member 3 — Borrowing Workflow, Integration, and QA Developer

**Primary responsibility:** Implement the borrowing workflow, connect the frontend to the backend, and coordinate testing.

Tasks:
- Implement the borrowing request workflow with Member 1.
- Build the user dashboard and request management interface.
- Connect frontend forms and pages to the API.
- Display borrowing request statuses.
- Implement relevant dashboard summaries.
- Test interactions between the frontend, backend, and database.
- Maintain test cases and document defects.
- Assist with deployment, documentation, and presentation preparation.

**Main deliverables:**
- Borrowing request interface.
- User dashboard.
- Request management interface.
- Integrated frontend and backend.
- Test results and defect log.
- Deployment and presentation support.

### Important: Do not work in isolation

These are primary assignments, not strict boundaries.

For example, Member 1 can implement an API, but Member 3 should help verify that it works with the frontend. Similarly, Member 2 should test the pages against real backend responses rather than relying exclusively on sample data.

All three members should participate in testing and the final demonstration.

---

## 3. Detailed Weekly Project Timeline

## WEEK 1: October 12–18

### Phase 1 — Project Planning and Requirements Analysis

**Goal:** Agree on exactly what lendNborrow will do before writing substantial amounts of code.

This week is important because unclear requirements can cause expensive changes later.

### October 12–13: Project kickoff

**Tasks:**
1. Confirm the three group members.
2. Assign primary roles and responsibilities.
3. Review the IT 314 final project guidelines.
4. Discuss the problem lendNborrow intends to solve.
5. Identify the target users.
6. Agree on the development tools and technologies.
7. Create a shared communication channel.

Decide on the project's initial technical stack.

| Component | Recommended Technology | Purpose |
|---|---|---|
| Frontend | HTML | Structure the website. |
| Styling | CSS | Design the interface and responsive layouts. |
| Frontend logic | JavaScript | Handle interactions and communicate with the API. |
| Backend | Node.js | Run the server-side JavaScript application. |
| Backend framework | Express.js | Define routes and build the API. |
| Database | PostgreSQL | Store users, items, and borrowing requests. |
| Version control | Git and GitHub | Manage code and collaborate. |
| Code editor | VS Code | Write and debug the code. |

PostgreSQL is a practical choice because the project contains related entities such as users, items, and borrowing requests.

For the first version, use a conventional HTML, CSS, and JavaScript frontend served by Express.js. A separate frontend framework is unnecessary unless your group already knows one and can use it without significantly increasing development time.

### October 14–15: Define the system requirements

Write down the features that the website must support.

**Core functional requirements:**

1. Users can register and log in.
2. Users can browse available items.
3. Users can search for items.
4. Users can view item details.
5. Users can list items they are willing to lend.
6. Users can edit or remove their own listings.
7. Users can submit borrowing requests.
8. Lenders can approve or reject incoming requests.
9. Users can view their borrowing and lending activity.
10. Users can track borrowing statuses.
11. Users can mark approved loans as returned, subject to the agreed workflow.
12. The system prevents users from managing items or requests that do not belong to them.

Also define basic nonfunctional requirements:
- Responsive design for desktop and mobile.
- Secure password storage.
- Server-side input validation.
- Appropriate access controls.
- Clear success and error messages.

### October 16–17: Define user flows

Map how users will navigate the system.

**Example borrowing flow:**

```text
User opens lendNborrow
          |
          v
Browses available items
          |
          v
Opens an item's details
          |
          v
Logs in or registers
          |
          v
Submits a borrowing request
          |
          v
Lender reviews the request
          |
          +------------------+
          |                  |
          v                  v
       Approved            Rejected
          |
          v
Borrower receives or
views the updated status
          |
          v
Item is returned
          |
          v
Loan is marked as returned
```

Define the lending flow as well:

```text
Lender logs in
      |
      v
Opens dashboard
      |
      v
Adds an item
      |
      v
Item appears in listings
      |
      v
Receives borrowing request
      |
      v
Approves or rejects request
      |
      v
Tracks the loan until return
```

These flows should guide both interface design and backend development.

### October 18: Week 1 checkpoint

**Expected deliverables:**
- Confirmed group roles.
- Approved project scope.
- List of functional requirements.
- User flow diagrams.
- Initial list of website pages.
- Confirmed technology stack.
- GitHub repository created.

**Milestone:** Your group can clearly explain what lendNborrow does and how a user completes its main tasks.

---

## WEEK 2: October 19–25

### Phase 2 — System Design and Project Setup

**Goal:** Prepare the database, interface designs, and development environment.

### October 19–20: Design the database

Member 1 leads the database design, with input from the other members.

Start with three essential tables.

**1. Users**

| Column | Purpose |
|---|---|
| user_id | Unique user identifier |
| name | User's name |
| email | Account email |
| password_hash | Securely stored password hash |
| created_at | Account creation date |

**2. Items**

| Column | Purpose |
|---|---|
| item_id | Unique item identifier |
| owner_id | User who owns or lists the item |
| title | Item name |
| description | Item details |
| category | Item category |
| condition | Current item condition |
| image_url | Optional item image reference |
| availability_status | Whether the item can be requested |
| created_at | Listing creation date |

**3. Borrowing Requests**

| Column | Purpose |
|---|---|
| request_id | Unique request identifier |
| item_id | Requested item |
| borrower_id | User requesting the item |
| start_date | Intended borrowing date, if required |
| end_date | Intended return date, if required |
| status | Current request or loan status |
| created_at | Request creation date |

Use foreign keys to connect the tables.

You may add a fourth table later if the implemented features require it, but do not add tables without a clear purpose.

**Important design decisions:**
- A user must not be allowed to borrow their own item.
- Only the owner should be able to manage their listings.
- Only the relevant lender should be able to approve or reject a request.
- An item should not be approved for multiple overlapping loans.
- Request status and item availability must remain consistent.

### October 20–21: Create wireframes

Member 2 leads the interface design.

Prepare wireframes for these pages:

1. Landing page.
2. Registration page.
3. Login page.
4. Item browsing page.
5. Item details page.
6. Add or edit item page.
7. User dashboard.
8. Incoming borrowing requests page.
9. My borrowing requests page.

You do not need elaborate prototypes. A simple layout in Figma, Canva, or even paper is sufficient if it clearly communicates the intended interface.

### October 22–23: Set up the project

Member 1 establishes the backend and database environment.

Member 2 prepares the frontend structure.

Member 3 defines the integration approach and initial testing checklist.

A possible project structure is:

```text
lendNborrow/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── items.js
│   │   └── requests.js
│   └── images/
│
├── views/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── browse.html
│   ├── item-details.html
│   ├── dashboard.html
│   └── requests.html
│
├── routes/
│   ├── auth.js
│   ├── items.js
│   └── requests.js
│
├── middleware/
│   └── auth.js
│
├── config/
│   └── database.js
│
├── sql/
│   └── schema.sql
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

This is a suggested structure, not a mandatory one. Adjust it as needed.

Keep database credentials and session secrets in environment variables. Do not commit your actual `.env` file or credentials to GitHub.

### October 24–25: Establish the interface and API contract

Before implementing all the features, agree on how the frontend and backend will communicate.

For example:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/items` | Browse available items |
| GET | `/api/items/:id` | View an item |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Remove an item |
| POST | `/api/requests` | Submit a borrowing request |
| GET | `/api/requests/incoming` | View requests for owned items |
| GET | `/api/requests/outgoing` | View submitted requests |
| PATCH | `/api/requests/:id/status` | Process a request or update its status |

Member 1 should document the expected request and response formats. Members 2 and 3 should review them.

**Expected deliverables by October 25:**
- Database schema.
- Initial wireframes.
- Project folder structure.
- Working development environment.
- GitHub repository with a clear README.
- Initial Express.js server.
- Agreed API endpoints.

**Milestone:** The project is ready for feature development, and the members agree on how its components fit together.

---

## WEEK 3: October 26 – November 1

### Phase 3 — Authentication and Item Management

**Goal:** Allow users to access the website and manage item listings.

This is the first major development week.

### October 26–28: Implement authentication

**Member 1:**
- Implement registration and login endpoints.
- Connect authentication to PostgreSQL.
- Hash passwords using a suitable password-hashing library.
- Implement authentication and authorization middleware.
- Configure secure session handling.

**Member 2:**
- Complete registration and login pages.
- Add client-side validation.
- Display validation and authentication errors.
- Add navigation between authentication pages.

**Member 3:**
- Connect the frontend forms to the backend.
- Test account registration.
- Test login and logout.
- Verify that unauthenticated users cannot access protected operations.

Prefer established authentication libraries and session-management packages rather than writing authentication security mechanisms from scratch.

### October 29–30: Implement item management

**Member 1:**
- Implement item creation.
- Implement item retrieval.
- Implement item updates.
- Implement item deletion.
- Validate submitted item data.
- Enforce ownership permissions.

**Member 2:**
- Build the item listing form.
- Build item cards.
- Build the item details page.
- Display item availability and condition.
- Implement the interface for editing and removing listings.

**Member 3:**
- Connect the listing forms to the API.
- Verify that new items appear in the browse page.
- Test item updates and deletion.
- Check that one user cannot modify another user's listings.

### October 31 – November 1: Implement browsing and search

Implement:
- Item browsing.
- Search by item name.
- Category filtering.
- Item detail viewing.
- Availability filtering.
- Empty-state messages when no results match.

Keep search simple. Basic database queries and frontend filtering are sufficient for the initial version, depending on the dataset size and implementation.

### Week 3 checkpoint

By November 1, a user should be able to:

1. Register an account.
2. Log in and log out.
3. Add an item.
4. View available items.
5. Search for items.
6. Open item details.
7. Edit or remove their own listings.

**Milestone:** The authentication and item management features work with the actual database.

Do not proceed on the assumption that a feature is finished simply because its interface has been created. Verify that the data persists after refreshing the page.

---

## WEEK 4: November 2–8

### Phase 4 — Borrowing Request System

**Goal:** Implement the primary feature that distinguishes lendNborrow from an ordinary item listing website.

### November 2–4: Create borrowing requests

**Member 1:**
- Implement the borrowing request endpoint.
- Validate the requested item.
- Verify that the borrower is not the owner.
- Check item availability.
- Save the request to PostgreSQL.
- Implement appropriate error responses.

**Member 2:**
- Add a borrowing request button to item details.
- Create the borrowing request form.
- Display request submission results.
- Add confirmation messages and validation feedback.

**Member 3:**
- Connect the request form to the backend.
- Implement the outgoing requests interface.
- Display the current status of each request.
- Test successful and unsuccessful request submissions.

### November 5–6: Implement lender request management

Build the interface and backend operations for lenders to:
- View incoming borrowing requests.
- Identify the borrower and requested item.
- Approve a pending request.
- Reject a pending request.
- See the updated request status.

Implement authorization checks on the server. Hiding buttons in the interface is not sufficient to protect an operation.

Also handle invalid transitions. For example, a rejected request should not subsequently be approved through a direct API call.

### November 7–8: Implement borrowing status tracking

Use a simple, well-defined set of statuses:

| Status | Meaning |
|---|---|
| Pending | The lender has not made a decision. |
| Approved | The lender has approved the request. |
| Rejected | The lender has declined the request. |
| Cancelled | The borrower cancelled a request that was still eligible for cancellation. |
| Returned | The item has been returned and the loan is closed. |

An approved request represents an active loan. You do not need a separate `Borrowed` status unless your group decides that the handover process needs to be tracked independently.

For the MVP, a lender can mark an approved loan as returned after receiving the item.

Ensure that:
- Only authorized users can change statuses.
- Requests can only move through permitted transitions.
- Returning an item restores its availability when appropriate.
- A second active loan cannot be approved for the same item.
- Repeated requests do not create duplicate or inconsistent loan records.

For simplicity, you can initially allow only one active loan per item and use an explicit availability field.

### Week 4 checkpoint

Demonstrate this complete workflow:

```text
Lender lists an item
        |
        v
Borrower finds the item
        |
        v
Borrower submits a request
        |
        v
Lender views the request
        |
        v
Lender approves or rejects it
        |
        v
Both users can view the status
        |
        v
Approved loan is marked returned
        |
        v
Item becomes available again
```

**Milestone:** The complete borrowing workflow operates through the frontend, Express.js backend, and PostgreSQL database.

This is the most important functional milestone in the project.

---

## WEEK 5: November 9–15

### Phase 5 — Dashboards and System Integration

**Goal:** Connect the major features into a coherent website that users can operate without assistance.

At this stage, avoid starting major new features. Concentrate on completing and integrating the agreed scope.

### November 9–11: Build the user dashboard

Member 2 and Member 3 collaborate on the interface and integration.

The dashboard should help users understand their activity at a glance.

**Suggested dashboard components:**

| Component | Information Displayed |
|---|---|
| My Listings | Number of items listed by the user. |
| Available Items | Listings that are available to borrow. |
| Incoming Requests | Requests for the user's items. |
| My Borrowing Requests | Requests submitted by the user. |
| Pending Requests | Requests awaiting a decision. |
| Active Loans | Approved loans that have not been returned. |
| Completed Loans | Loans marked as returned. |

These figures should come from actual database records rather than hardcoded values.

Do not spend too much time creating complex charts. A small number of useful summary cards and a clear request table are sufficient for the first version.

### November 12–13: Integrate all pages

Review the entire website.

Check:
- Navigation links work.
- Login state is handled consistently.
- Protected pages and API operations require authentication.
- Item listings display the correct data.
- Search and category filtering work.
- Borrowing requests appear in the correct dashboard.
- Request statuses update correctly.
- The interface displays backend errors appropriately.
- The website does not depend on hardcoded sample data for its core functions.

### November 14–15: Improve responsive design

Test the website at different viewport widths.

Prioritize:
- Desktop layout.
- Tablet layout.
- Mobile layout.

Check that:
- Navigation remains usable.
- Forms fit smaller screens.
- Item cards resize appropriately.
- Tables do not overflow their containers.
- Buttons are accessible and easy to tap.
- Text remains readable.
- Modals and dialogs fit the viewport.

**Week 5 checkpoint:**

By November 15, every essential feature should be connected and usable.

The group should be able to demonstrate the entire borrowing workflow without manually changing the database to make the demonstration work.

**Milestone:** Feature-complete MVP.

---

## WEEK 6: November 16–22

### Phase 6 — Testing, Bug Fixing, and Refinement

**Goal:** Make the application stable enough for an actual live demonstration.

Do not use this week to redesign the entire website or introduce unrelated features.

### November 16–17: Functional testing

Member 3 coordinates testing, while all three members test the features they implemented and review one another's work.

Use a test checklist.

| Test Case | Expected Result |
|---|---|
| Register with valid information | Account is created. |
| Register with an existing email | Registration is rejected appropriately. |
| Log in with correct credentials | User can access authenticated features. |
| Log in with incorrect credentials | Login fails with a suitable message. |
| Add an item | Item is saved to the database. |
| Search for an existing item | Matching items appear. |
| Search for a nonexistent item | An appropriate empty state appears. |
| Submit a borrowing request | Request is saved with Pending status. |
| Approve a request | Request status becomes Approved. |
| Reject a request | Request status becomes Rejected. |
| Attempt an unauthorized update | Server rejects the operation. |
| Attempt to borrow one's own item | Request is rejected. |
| Mark an approved loan as returned | Loan closes and availability updates appropriately. |
| Refresh a page | Previously saved data remains available. |
| Use the website on mobile | Content remains usable and responsive. |

Add more cases when testing reveals other important scenarios.

### November 18–19: Security and data integrity checks

Prioritize:
- Passwords are hashed rather than stored as plain text.
- SQL queries use parameterized statements or an appropriate query builder.
- Users cannot access another user's private account operations.
- Users cannot edit or delete another user's items.
- Users cannot approve requests addressed to other lenders.
- API inputs are validated on the server.
- Authentication secrets are not exposed in frontend code.
- Session cookies are configured appropriately.
- Invalid request status transitions are rejected.

Also verify that item availability and borrowing statuses remain consistent when requests are approved, cancelled, or returned.

### November 20–21: Bug fixing and visual refinement

Fix issues in this order:

**Priority 1 — Critical**
- Server crashes.
- Database connection failures.
- Registration or login failures.
- Borrowing requests that cannot be processed.
- Unauthorized access.
- Incorrect loan or availability states.

**Priority 2 — Important**
- Forms that fail to submit.
- Broken navigation.
- Incorrect dashboard information.
- Search and filtering failures.
- Missing or inconsistent request statuses.

**Priority 3 — Cosmetic**
- Inconsistent spacing.
- Minor typography issues.
- Small alignment problems.
- Nonessential animations.

Do not spend hours polishing a button while a critical borrowing workflow remains broken.

### November 22: User acceptance testing

Have each member test the website using a different user account.

A useful scenario is:

1. Account A registers and lists a book.
2. Account B registers and finds the book.
3. Account B requests to borrow it.
4. Account A approves the request.
5. Both accounts display the correct status.
6. The loan is marked as returned.
7. The item becomes available again.

Repeat the test with rejection and unauthorized actions.

**Milestone:** The core features pass the group's functional and integration tests.

By the end of this week, the system should be stable enough to demonstrate from beginning to end.

---

## WEEK 7: November 23–29

### Phase 7 — Deployment, Documentation, and Presentation Preparation

**Goal:** Finalize the deliverables and ensure the group can demonstrate the system within the 10-minute presentation limit.

### November 23–24: Deployment and final environment checks

Choose a deployment method that your group can configure and maintain.

Tasks:
- Deploy the Node.js and Express.js application.
- Configure the production database.
- Set environment variables.
- Confirm that the deployed application can connect to PostgreSQL.
- Verify that all essential routes work.
- Test account registration and borrowing requests in the deployed environment.
- Resolve configuration and database migration issues.

If your group uses local hosting instead, ensure the application runs reliably on the demonstration machine and can be started using documented commands.

**Do not assume deployment is complete simply because the homepage loads.** Test the full borrowing workflow in the actual environment that will be used for the presentation.

### November 25–26: Complete project documentation

Prepare the following materials.

**1. Project README**

Include:
- Project title.
- Project overview.
- Problem statement.
- Objectives.
- Target users.
- Main features.
- Technology stack.
- Installation instructions.
- Database setup instructions.
- Environment variable requirements.
- Instructions for running the application.

**2. System documentation**

Include the most relevant diagrams and explanations:
- System architecture diagram.
- Entity-relationship diagram (ERD).
- Database table descriptions.
- User flow diagram.
- API endpoint documentation.
- Screenshots of the completed system.

**3. Testing documentation**

Document:
- Test cases.
- Expected results.
- Actual results.
- Identified defects.
- Fixes implemented.
- Remaining limitations, if any.

**4. Group contribution documentation**

Clearly state the responsibilities and contributions of all three members.

Keep the documentation accurate to the actual implementation. Do not describe features that the website does not support.

### November 27: Prepare the presentation

Create a short slide deck.

Suggested slide structure:

| Slide | Content | Target Time |
|---|---|---:|
| 1 | Project title and group introduction | 45 seconds |
| 2 | Problem statement and objectives | 1 minute |
| 3 | Project overview and technology stack | 1 minute |
| 4 | System architecture and database design | 1 minute |
| 5 | Main website features | 1 minute |
| 6 | Live system demonstration | 3 minutes |
| 7 | Development process and testing | 1 minute |
| 8 | Conclusion | 30 seconds |
| **Total** | | **9 minutes 15 seconds** |

This leaves approximately 45 seconds of flexibility within the 10-minute limit.

Adjust the allocation based on your instructor's expectations.

### November 28: Rehearsal

Conduct at least two full rehearsals.

Each member should:
- Know their assigned speaking portion.
- Understand the purpose of the system.
- Be able to explain their technical contributions.
- Know the main user flow.
- Be prepared to answer questions about the database, backend, and frontend.

Practice the actual demonstration rather than only reading the slides.

Use prepared demonstration accounts and realistic sample data.

Avoid spending too much time on registration during the live demonstration. Have the accounts ready so you can proceed directly to the essential features.

### November 29: Final quality check

Treat November 29 as the internal completion deadline.

Verify the following:

- [ ] All essential features work.
- [ ] The frontend communicates with the backend.
- [ ] The database stores and retrieves data correctly.
- [ ] Registration and login work.
- [ ] Item listing, browsing, and search work.
- [ ] Borrowing requests work.
- [ ] Request approval and rejection work.
- [ ] Borrowing statuses update correctly.
- [ ] Dashboard information is accurate.
- [ ] Responsive layouts have been tested.
- [ ] No critical bugs remain.
- [ ] Documentation is complete.
- [ ] The final project folder is organized.
- [ ] The presentation is ready.
- [ ] The project can run in the intended demonstration environment.

**Milestone:** The project is ready for presentation.

After this date, limit changes to necessary fixes. Avoid adding new features that could introduce unexpected bugs.

---

## November 30: Contingency and Buffer Day

Keep this day free for unexpected problems.

Possible issues include:
- Deployment failures.
- Database connection problems.
- Broken environment variables.
- Missing project files.
- Last-minute documentation corrections.
- Presentation equipment problems.

If nothing goes wrong, use the day to verify the project and rest before the presentation.

Do not schedule essential development tasks for this date.

---

## WEEK 8: December 1–5

### Phase 8 — Final Presentation and Submission

**Goal:** Demonstrate the working system and complete the required submission.

Since your instructor may assign a specific presentation date within this period, prepare for the possibility that your group will present early in the week.

### December 1–2: Final demonstration preparation

Tasks:
- Confirm the presentation schedule.
- Verify the internet connection if using a deployed application.
- Test the demonstration environment.
- Prepare the project folder.
- Verify that all group members can access the necessary files.
- Review the presentation and speaking assignments.

If the group presents on these dates, demonstrate the system according to the approved schedule.

### December 3–4: Address administrative requirements

Tasks:
- Verify that the documentation links work.
- Confirm the group number and member names.
- Check the section workbook.
- Confirm the topic approval date.
- Verify the project title and submission date.
- Review all required Google Sheet entries.

If your presentation is scheduled for these dates, prioritize it accordingly.

### December 5: Submission deadline

Complete the final checks:

- [ ] Final project folder submitted.
- [ ] Required documentation submitted.
- [ ] Google Sheet entries completed.
- [ ] Documentation links verified.
- [ ] All required group information entered.
- [ ] Submission confirmed.

Do not wait until the final minutes to upload the project.

**Final milestone:** lendNborrow has been presented and submitted according to the IT 314 requirements.

---

## 4. Feature Prioritization: What Should You Actually Build?

A major risk for a three-person group is attempting to build too many features before the deadline.

I recommend separating the scope into three levels.

### Priority 1 — Must Have

These features are necessary to demonstrate the core purpose of lendNborrow.

| Feature | Description |
|---|---|
| User registration | Users can create accounts. |
| User login/logout | Users can access and leave their accounts. |
| Item listings | Lenders can list items. |
| Item browsing | Users can see available items. |
| Search and filtering | Users can find relevant items. |
| Item details | Users can inspect an item's information. |
| Item management | Lenders can update or remove their listings. |
| Borrowing requests | Borrowers can request items. |
| Request management | Lenders can approve or reject requests. |
| Status tracking | Users can track their requests and active loans. |
| Return management | Approved loans can be marked as returned. |
| Dashboard | Users can review their lending and borrowing activity. |
| Responsive interface | The website works on desktop and mobile. |
| Database integration | The system persists data in PostgreSQL. |

Complete these features before considering additional functionality.

### Priority 2 — Good to Have

Add these only if the essential features are already stable.

- Item image uploads.
- Additional category filters.
- Sorting by newest listings.
- Date-based borrowing requests.
- Dashboard charts.
- Listing availability calendars.
- More detailed item condition information.

Choose features that improve the actual lending workflow rather than adding complexity for its own sake.

### Priority 3 — Avoid Unless Time Permits

These features can expand the project considerably.

- Real-time chat.
- Online payments or deposits.
- SMS notifications.
- Complex recommendation algorithms.
- Google Maps integration.
- AI-powered item recommendations.
- Social media authentication.
- Advanced ratings and reputation systems.

They are not necessary to meet the project's stated objectives.

**My recommendation:** Complete all Priority 1 features, select at most one or two Priority 2 features, and skip Priority 3 features for the initial submission.

---

## 5. Weekly Workload and Accountability

A timeline is only useful if the members consistently complete their assigned tasks.

For a student group balancing other subjects, use a realistic weekly commitment.

### Recommended time allocation

| Period | Suggested Effort per Member | Focus |
|---|---:|---|
| Oct 12–18 | 4–6 hours | Planning and requirements |
| Oct 19–25 | 5–7 hours | System design and setup |
| Oct 26–Nov 1 | 6–8 hours | Authentication and item management |
| Nov 2–8 | 6–8 hours | Borrowing workflow |
| Nov 9–15 | 6–8 hours | Integration and dashboards |
| Nov 16–22 | 6–8 hours | Testing and bug fixing |
| Nov 23–29 | 6–9 hours | Documentation, deployment, and rehearsal |

These are planning estimates, not guarantees. Some tasks may take longer if the group encounters unfamiliar technologies.

Aim for approximately two or three focused work sessions per member each week instead of relying on one long session immediately before a deadline.

### Suggested weekly meeting schedule

**Meeting 1 — Start of the week, 20–30 minutes**

Each member reports:
- What they completed last week.
- What they will work on next.
- What they need from the other members.
- Any blockers that could affect the timeline.

**Meeting 2 — Midweek, 30–45 minutes**

Review progress, resolve integration issues, and confirm that connected features work.

**Meeting 3 — End of the week, 30–60 minutes**

Demonstrate completed work, test the relevant features, and agree on the next week's priorities.

Meetings should focus on decisions and working software rather than lengthy status reports.

### GitHub workflow

Use GitHub to coordinate development.

A simple workflow is sufficient:

1. Keep the `main` branch stable.
2. Create a separate branch for each feature or task.
3. Commit changes regularly.
4. Review changes before merging.
5. Test the merged code.
6. Record major bugs and unfinished tasks in GitHub Issues or a shared task board.

Example branches:

```text
main
├── feature/authentication
├── feature/item-management
├── feature/borrowing-requests
├── feature/dashboard
└── fix/responsive-layout
```

These are examples; actual branch names should reflect the work being done.

Do not wait until the end of the semester to combine separately developed components.

---

## 6. Project Milestones and Completion Criteria

Use these milestones to determine whether the project is on schedule.

| Deadline | Milestone | Evidence of Completion |
|---|---|---|
| October 18 | Requirements finalized | Approved feature list and user flows |
| October 25 | System design completed | Database schema, wireframes, and working project setup |
| November 1 | Core features implemented | Authentication, item management, and search work |
| November 8 | Borrowing workflow implemented | Requests can be submitted, processed, and tracked |
| November 15 | Feature-complete MVP | Essential pages and workflows are integrated |
| November 22 | Testing completed | Core test cases pass and critical bugs are resolved |
| November 26 | Documentation completed | README, diagrams, and testing records are ready |
| November 28 | Presentation rehearsed | All members can deliver their assigned portions |
| November 29 | Development finalized | Stable, demonstrable project |
| December 1–5 | Presentation and submission | Live demonstration and required submissions completed |

### What if your group falls behind?

Use these rules to recover time.

**If authentication is unfinished by November 1:** Stop working on optional interface details and prioritize authentication, database integration, and item management.

**If borrowing requests are unfinished by November 8:** Do not add optional features. Focus on completing the request lifecycle and testing its database operations.

**If the dashboard is unfinished by November 15:** Reduce it to a few useful summary cards and simple request tables.

**If major bugs remain by November 22:** Freeze the feature set. Spend the remaining development time fixing defects rather than adding functionality.

**If deployment is difficult by November 26:** Use the simplest reliable deployment option your group can support, or prepare a thoroughly tested local demonstration if permitted by your instructor.

---

## 7. Recommended Project Demonstration

Because the presentation is limited to 10 minutes, your demonstration should show a complete user journey rather than every page individually.

Use two prepared accounts: one lender and one borrower.

### Demonstration sequence

**1. Introduce the project — 45 seconds**

Explain the problem lendNborrow addresses and identify the target users.

**2. Show the landing page and item listings — 45 seconds**

Demonstrate how users browse and search for items.

**3. Show the lender's account — 60 seconds**

Display the lender's dashboard and an existing item listing.

**4. Demonstrate a borrowing request — 60 seconds**

Switch to the borrower account, select an item, and submit a request.

**5. Demonstrate request management — 60 seconds**

Switch back to the lender account and approve or reject the request.

**6. Demonstrate status tracking — 45 seconds**

Show the updated status from the relevant accounts.

**7. Explain the technical implementation — 60 seconds**

Briefly explain how the frontend, Express.js backend, and PostgreSQL database work together.

**8. Conclude — 30 seconds**

Summarize the system's purpose and its main benefits.

Keep the actual demonstration focused on working functionality. Avoid showing long code files or spending too much time navigating between unrelated pages.

Each member should have a clear speaking role. For example:

- **Member 1:** Technical architecture, backend, and database.
- **Member 2:** User interface, responsive design, and item browsing.
- **Member 3:** Borrowing workflow, dashboard, testing, and integration.

All three should understand the complete system, even if each member presents a different section.

---

## 8. Final Recommendation

For lendNborrow, I would organize development around **three major deliverables**:

1. **By November 1:** Users can register, log in, and manage item listings.
2. **By November 15:** The complete borrowing workflow and user dashboard work with the database.
3. **By November 29:** The website is tested, documented, and ready for presentation.

Everything else should support these three goals.

The most important thing to avoid is treating frontend development, backend development, and integration as separate projects that only come together at the end. Start connecting the components as early as Week 2, test the borrowing workflow as soon as it exists, and reserve the final week for stabilization rather than major development.

**The target is a stable, fully functional lendNborrow MVP by November 22, with November 23–29 reserved for finalization and December 1–5 reserved for presentation and submission.**
