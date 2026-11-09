import { Router } from 'express';

const router = Router();

// ── Phase 2 & 5 endpoints (documented, not yet implemented) ──
//
// GET /api/admin/verifications            — Verification queue
// PUT /api/admin/verifications/:id/approve — Approve student
// PUT /api/admin/verifications/:id/reject  — Reject student
//

router.all('/*', (_req, res) => {
  res.status(501).json({ error: 'Admin endpoints not yet implemented (Phase 2)' });
});

export default router;

