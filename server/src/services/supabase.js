import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  isSupabaseConfigured,
  missingVars
} from '../config/env.js';

let supabaseAdmin = null;
let supabaseAnon = null;

if (isSupabaseConfigured) {
  try {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
    supabaseAdmin = null;
    supabaseAnon = null;
  }
}

/**
 * Middleware that guards routes requiring a configured Supabase backend.
 * Returns a friendly 503 instead of crashing when unconfigured.
 */
export function requireSupabase(req, res, next) {
  if (!supabaseAdmin || !isSupabaseConfigured) {
    return res.status(503).json({
      error: 'Supabase is not configured. Please set real credentials in server/.env.',
      missing: missingVars
    });
  }
  next();
}

export { supabaseAdmin, supabaseAnon, isSupabaseConfigured };
