import { Router } from 'express';

const router = Router();

// ── Phase 2 endpoints (documented, not yet implemented) ────
//
// POST /api/auth/register  — Create Supabase user + profile row
// POST /api/auth/login     — Sign in, set HTTP-only session cookie
// POST /api/auth/logout    — Destroy session cookie
// GET  /api/auth/session   — Return current user + profile (or 401)
// PUT  /api/auth/profile   — Update profile fields
// POST /api/auth/upload-id — Upload student-ID image to Storage
// PUT  /api/auth/password  — Change password
//

router.all('/*', (_req, res) => {
  res.status(501).json({ error: 'Auth endpoints not yet implemented (Phase 2)' });
});

export default router;

