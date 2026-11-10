import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt loading server/.env or root .env
const serverEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';
export const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@g.batstate-u.edu.ph';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'item-images';
export const GOOGLE_AUTH_ENABLED = String(process.env.GOOGLE_AUTH_ENABLED).toLowerCase() === 'true';
export const SEED_DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'CHANGE_ME_DEMO_PASSWORD';

/**
 * Checks if a string value is an unconfigured placeholder.
 */
function isPlaceholder(val) {
  if (!val || typeof val !== 'string') return true;
  const trimmed = val.trim();
  return (
    trimmed === '' ||
    trimmed.startsWith('YOUR_') ||
    trimmed.startsWith('CHANGE_ME_') ||
    trimmed === 'https://your-project-ref.supabase.co' ||
    trimmed.includes('xxxxx')
  );
}

// Identify unconfigured variables and warn clearly
export const missingVars = [];
if (isPlaceholder(SUPABASE_URL)) missingVars.push('SUPABASE_URL');
if (isPlaceholder(SUPABASE_ANON_KEY)) missingVars.push('SUPABASE_ANON_KEY');
if (isPlaceholder(SUPABASE_SERVICE_ROLE_KEY)) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

export const isSupabaseConfigured = missingVars.length === 0;

if (!isSupabaseConfigured) {
  console.warn('\n⚠️  [lendNborrow] WARNING: Supabase is not fully configured.');
  console.warn(`   Missing or placeholder variables: ${missingVars.join(', ')}`);
  console.warn('   The server will run in unconfigured mode: static pages are served,');
  console.warn('   GET /api/health returns 503, and database operations return 503.\n');
}

