# lendNborrow — User Flows

## Flow A: Standard Lending and Borrowing Flow
1. **Browse & Discovery:** Borrower browses available items on `browse.html` and selects an item to view `item.html`.
2. **Borrow Request:** Borrower submits a borrow request specifying start date, return date, and a message. Request created with status `pending`.
3. **Owner Review:** Item owner views pending requests in `incoming-requests.html`.
4. **Approval:** Owner approves the request. Request status changes to `approved`; item status changes to `borrowed`. Other pending requests for the same item are rejected.
5. **Item Handover & Use:** Borrower receives and uses the item until the agreed due date.
6. **Return & Inspection:** Borrower returns the item. Owner marks the item as returned on `borrowed.html` specifying return condition (`good`).
7. **Completion & Credit Score:** Request status changes to `returned`; item status changes back to `available`. Borrower's credit score increases (+5).

---

## Flow B: Damaged, Lost, or Overdue Flow
1. **Overdue Status:** If the due date passes without return, the item is flagged as overdue on `borrowed.html`. Credit score penalized (-10).
2. **Return with Issues:** Borrower returns item in damaged condition, or reports item lost.
3. **Owner Resolution:** Owner marks request as returned with condition `damaged` or `lost`.
4. **Credit Score Penalty:** Borrower's credit score is penalized (-20).
5. **Compensation Record:** A compensation entry is automatically generated in `compensations` with reason (`damaged` or `lost`), amount determined by owner, and `paid = false`.
6. **Settlement:** Borrower settles the fee; owner marks compensation as `paid = true`.
