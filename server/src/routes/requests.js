import { Router } from 'express';

const router = Router();

// ── Phase 4 endpoints (documented, not yet implemented) ────
//
// POST /api/requests                    — Create borrow request
// GET  /api/requests/mine               — Borrower's requests
// GET  /api/requests/incoming           — Owner's incoming requests
// GET  /api/requests/active-borrows     — Currently borrowed items
// PUT  /api/requests/:id/approve        — Approve (+ reject other pending)
// PUT  /api/requests/:id/reject         — Reject
// PUT  /api/requests/:id/cancel         — Cancel (borrower only)
// PUT  /api/requests/:id/pickup         — Confirm pickup
// PUT  /api/requests/:id/submit-return  — Submit return
// PUT  /api/requests/:id/confirm-return — Confirm return (owner)
//

router.all('/*', (_req, res) => {
  res.status(501).json({ error: 'Request endpoints not yet implemented (Phase 4)' });
});

export default router;

