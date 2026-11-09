import '../config/env.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error(
    'Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Copy server/.env.example to server/.env and fill in your Supabase credentials.'
  );
  process.exit(1);
}

/**
 * Admin client — bypasses Row Level Security.
 * Use for all server-side operations (CRUD, auth admin, storage).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * Auth client — used only for email/password sign-up and sign-in flows.
 * Database and Storage access remains server-side through supabaseAdmin.
 */
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export { supabaseUrl };

