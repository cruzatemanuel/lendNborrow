import { supabaseAdmin, isSupabaseConfigured } from '../services/supabase.js';

/**
 * Verifies that the incoming request has a valid Supabase auth session token
 * from the httpOnly cookie or Authorization header.
 * Attaches `req.user` and `req.profile` to the request object.
 */
export async function requireAuth(req, res, next) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return res.status(503).json({
      error: 'Supabase is not configured. Please set credentials in server/.env.'
    });
  }

  // Token can come from httpOnly cookie or Bearer header
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    // Retrieve corresponding student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'Student profile not found.' });
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
}

/**
 * Ensures that the student has 'active' verification status AND has completed
 * mandatory profile fields (full name, student number, and college) before
 * creating listings or submitting borrow requests.
 */
export function requireActiveVerifiedStudent(req, res, next) {
  const profile = req.profile;
  if (!profile) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (profile.verification_status !== 'active') {
    return res.status(403).json({
      error: 'Your account is pending institutional email confirmation. Please verify your email.',
      code: 'UNVERIFIED_ACCOUNT'
    });
  }

  const isProfileComplete =
    Boolean(profile.full_name && profile.full_name.trim()) &&
    Boolean(profile.student_number && profile.student_number.trim()) &&
    Boolean(profile.college && profile.college.trim());

  if (!isProfileComplete) {
    return res.status(403).json({
      error: 'Please complete your student profile (full name, student number, and college) before continuing.',
      code: 'INCOMPLETE_PROFILE'
    });
  }

  next();
}

