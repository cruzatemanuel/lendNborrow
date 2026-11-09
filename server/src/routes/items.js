import { Router } from 'express';

const router = Router();

// ── Phase 3 endpoints (documented, not yet implemented) ────
//
// POST   /api/items          — Create item + upload image (multipart)
// GET    /api/items          — Browse items (search, filter, sort, paginate)
// GET    /api/items/mine     — Get current user's listings
// GET    /api/items/:id      — Get single item detail
// PUT    /api/items/:id      — Update item (owner only)
// DELETE /api/items/:id      — Delete item (owner only)
// PUT    /api/items/:id/availability — Toggle available/unavailable
//

router.all('/*', (_req, res) => {
  res.status(501).json({ error: 'Item endpoints not yet implemented (Phase 3)' });
});

export default router;

