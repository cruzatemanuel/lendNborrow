import { Router } from 'express';

const router = Router();

// ── Phase 5 endpoints (documented, not yet implemented) ────
//
// GET /api/analytics/dashboard      — Student dashboard stats
// GET /api/analytics/admin/summary  — Admin summary cards
// GET /api/analytics/trending       — Top items by borrow count
// GET /api/analytics/activity       — Borrowing activity over time
//

router.all('/*', (_req, res) => {
  res.status(501).json({ error: 'Analytics endpoints not yet implemented (Phase 5)' });
});

export default router;

