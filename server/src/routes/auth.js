import { Router } from 'express';
import {
  ALLOWED_EMAIL_DOMAIN,
  APP_BASE_URL,
  GOOGLE_AUTH_ENABLED,
  isSupabaseConfigured
} from '../config/env.js';
import { supabaseAdmin, supabaseAnon, requireSupabase } from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Strict regex check for BatStateU institutional email
const BATSTATEU_EMAIL_REGEX = /^[^@\s]+@g\.batstate-u\.edu\.ph$/i;

/**
 * Helper to set standard httpOnly session cookie.
 */
function setSessionCookie(res, token, expiresInSeconds = 7 * 24 * 3600) {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresInSeconds * 1000,
    path: '/'
  });
}

/**
 * GET /api/auth/config
 * Tells frontend if Google OAuth is enabled and the expected email domain.
 */
router.get('/config', (req, res) => {
  res.json({
    googleAuthEnabled: GOOGLE_AUTH_ENABLED,
    allowedEmailDomain: ALLOWED_EMAIL_DOMAIN
  });
});

/**
 * POST /api/auth/register
 * Enforces BatStateU GSuite institutional email domain.
 */
router.post('/register', requireSupabase, async (req, res) => {
  const { email, password, full_name, student_number, college, campus, contact } = req.body || {};

  const cleanEmail = (email || '').trim().toLowerCase();

  // Validate institutional email
  if (!cleanEmail || !BATSTATEU_EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      error: 'Registration restricted: only BatStateU GSuite accounts (@g.batstate-u.edu.ph) are allowed.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long.'
    });
  }

  try {
    // 1. Create user in Supabase Auth with email confirmation redirect
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${APP_BASE_URL}/signin.html?confirmed=1`,
        data: {
          full_name: (full_name || '').trim(),
          student_number: (student_number || '').trim(),
          college: (college || '').trim(),
          campus: (campus || 'Alangilan').trim(),
          contact: (contact || '').trim()
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'Failed to create user account.' });
    }

    // 2. Create corresponding record in public.profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: (full_name || '').trim(),
      student_number: (student_number || '').trim(),
      college: (college || '').trim(),
      campus: (campus || 'Alangilan').trim(),
      contact: (contact || '').trim(),
      verification_status: 'pending' // Becomes active once email confirmed
    });

    if (profileError) {
      console.error('Error creating profile record:', profileError.message);
      // Clean up user if profile insertion failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Failed to initialize student profile.' });
    }

    return res.status(201).json({
      message: 'Registration successful! Please check your BatStateU GSuite inbox to confirm your account.',
      email: cleanEmail
    });
  } catch (err) {
    console.error('Registration exception:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials, sets verification_status = 'active' on confirmed users,
 * and sets the httpOnly session cookie.
 */
router.post('/login', requireSupabase, async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const user = authData.user;
    const session = authData.session;

    if (!session || !session.access_token) {
      return res.status(401).json({
        error: 'Unable to establish session. Please verify your email first if prompted.'
      });
    }

    // Fetch student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError.message);
    }

    let currentProfile = profile;

    // First login after confirmation: auto-activate profile
    if (user.email_confirmed_at && (!currentProfile || currentProfile.verification_status === 'pending')) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          verification_status: 'active',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!updateError && updated) {
        currentProfile = updated;
      }
    }

    // Set secure httpOnly cookie
    setSessionCookie(res, session.access_token, session.expires_in || 7 * 86400);

    return res.json({
      message: 'Signed in successfully.',
      user: currentProfile || {
        id: user.id,
        email: user.email,
        verification_status: user.email_confirmed_at ? 'active' : 'pending'
      }
    });
  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: 'Sign in failed due to a server error.' });
  }
});

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('access_token', { path: '/' });
  res.json({ message: 'Signed out successfully.' });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and profile.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.profile
  });
});

/**
 * PATCH /api/auth/profile
 * Allows updating student information.
 */
router.patch('/profile', requireAuth, async (req, res) => {
  const { full_name, student_number, college, campus, contact, avatar_url } = req.body || {};

  const updates = {
    updated_at: new Date().toISOString()
  };

  if (full_name !== undefined) updates.full_name = full_name.trim();
  if (student_number !== undefined) updates.student_number = student_number.trim();
  if (college !== undefined) updates.college = college.trim();
  if (campus !== undefined) updates.campus = campus.trim();
  if (contact !== undefined) updates.contact = contact.trim();
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  try {
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Profile updated successfully.',
      user: updatedProfile
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * GET /api/auth/google/start
 * Generates Google OAuth redirect URL (only when enabled).
 */
router.get('/google/start', requireSupabase, async (req, res) => {
  if (!GOOGLE_AUTH_ENABLED) {
    return res.status(400).json({ error: 'Google authentication is currently disabled.' });
  }

  try {
    const { data, error } = await supabaseAnon.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_BASE_URL}/auth-callback.html`,
        queryParams: {
          hd: 'g.batstate-u.edu.ph'
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ url: data.url });
  } catch (err) {
    console.error('Google OAuth start error:', err);
    res.status(500).json({ error: 'Failed to initiate Google sign in.' });
  }
});

/**
 * POST /api/auth/google/session
 * Validates Google OAuth callback token, enforces institutional domain,
 * deletes unauthorized accounts, and sets session cookie.
 */
router.post('/google/session', requireSupabase, async (req, res) => {
  if (!GOOGLE_AUTH_ENABLED) {
    return res.status(400).json({ error: 'Google authentication is currently disabled.' });
  }

  const { access_token } = req.body || {};
  if (!access_token) {
    return res.status(400).json({ error: 'Missing access token.' });
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(access_token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid Google session token.' });
    }

    const email = (user.email || '').trim().toLowerCase();

    // STRICT DOMAIN ENFORCEMENT
    if (!BATSTATEU_EMAIL_REGEX.test(email)) {
      // Prompt requirement: Reject and delete the auth user if the email is not on the allowed domain
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return res.status(403).json({
        error: 'Only BatStateU GSuite accounts (@g.batstate-u.edu.ph) are permitted. Access was denied.'
      });
    }

    // Ensure profile row exists
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const meta = user.user_metadata || {};
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email,
          full_name: meta.full_name || meta.name || '',
          avatar_url: meta.avatar_url || meta.picture || null,
          verification_status: 'active'
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to initialize profile for Google user.' });
      }
      profile = newProfile;
    } else if (profile.verification_status !== 'active') {
      const { data: updated } = await supabaseAdmin
        .from('profiles')
        .update({ verification_status: 'active' })
        .eq('id', user.id)
        .select()
        .single();
      if (updated) profile = updated;
    }

    // Set cookie
    setSessionCookie(res, access_token);

    res.json({
      message: 'Google sign-in successful.',
      user: profile
    });
  } catch (err) {
    console.error('Google session error:', err);
    res.status(500).json({ error: 'Internal error processing Google session.' });
  }
});

export default router;

