import { supabaseAdmin } from '../services/supabase.js';

/**
 * Require authentication.
 * Reads the session token from an HTTP-only cookie, verifies it with
 * Supabase Auth, and attaches req.user and req.profile.
 */
export async function requireAuth(req, res, next) {
  // TODO Phase 2: implement session cookie verification
  //
  // 1. Read access_token from req.cookies.access_token
  // 2. Verify with supabaseAdmin.auth.getUser(token)
  // 3. Fetch profile from profiles table
  // 4. Attach to req.user and req.profile
  // 5. Handle token refresh if expired
  //
  res.status(501).json({ error: 'Authentication not yet implemented (Phase 2)' });
}

/**
 * Require admin role. Must be chained after requireAuth.
 */
export async function requireAdmin(req, res, next) {
  // TODO Phase 2: verify req.profile.role === 'admin'
  res.status(501).json({ error: 'Admin authorization not yet implemented (Phase 2)' });
}

/**
 * Require an active (verified) student. Must be chained after requireAuth.
 */
export async function requireVerified(req, res, next) {
  // TODO Phase 2: verify req.profile.verification_status === 'active'
  res.status(501).json({ error: 'Verification check not yet implemented (Phase 2)' });
}

