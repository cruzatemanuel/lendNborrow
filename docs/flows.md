# lendNborrow — Official User Flows

## Flow 0: Account Registration and Verification

1. A student registers with email, password, full name, student number, college, campus, contact number, and a student-ID image.
2. The account is saved with `verification_status = pending`.
3. An administrator reviews the submission in the verification queue.
4. The administrator approves or rejects it with a reason.
5. An approved student becomes `active` and can list or borrow items. A rejected student can correct and resubmit their details.

---

## Flow A: Standard Lending and Borrowing

1. An active borrower browses available items and opens an item detail page.
2. The borrower submits a request with start date, due date, and a message. The request is `pending`.
3. The owner reviews incoming requests and approves or rejects one.
4. Approval changes that request to `approved` and rejects other pending requests for the same item.
5. When the borrower picks up the item, the request becomes `borrowing` and the item becomes `borrowed`.
6. The borrower submits a return; the request becomes `return_submitted`.
7. The owner inspects and confirms the return as `good`. The request becomes `returned`, the item becomes `available`, and the configured on-time credit rule is applied.

---

## Flow B: Late, Damaged, or Lost Return

1. A request in `borrowing` whose due date has passed is shown as overdue.
2. The borrower submits a return or the owner records the item as damaged or lost.
3. The owner confirms the return and records the return condition.
4. The request becomes `returned`; damaged or lost items do not return to `available` status.
5. The configured late, damaged, or lost credit rule is applied.
6. For damage or loss, a compensation record is created with `paid = false` and an owner-provided amount.
7. After payment, the owner marks the compensation as paid.
