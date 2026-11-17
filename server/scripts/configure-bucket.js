import { SUPABASE_STORAGE_BUCKET, isSupabaseConfigured } from '../src/config/env.js';
import { supabaseAdmin } from '../src/services/supabase.js';

async function configureBucket() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.error('[ERROR] Supabase credentials are not configured in server/.env');
    process.exit(1);
  }

  console.log(`Checking bucket "${SUPABASE_STORAGE_BUCKET}"...`);
  const { data: bucket, error: getErr } = await supabaseAdmin.storage.getBucket(SUPABASE_STORAGE_BUCKET);

  if (getErr) {
    console.warn(`Bucket "${SUPABASE_STORAGE_BUCKET}" not found or failed to fetch: ${getErr.message}`);
    console.log(`Creating bucket "${SUPABASE_STORAGE_BUCKET}"...`);
    const { error: createErr } = await supabaseAdmin.storage.createBucket(SUPABASE_STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (createErr) {
      console.error(`[ERROR] Failed to create bucket: ${createErr.message}`);
      process.exit(1);
    }
    console.log(`[OK] Bucket "${SUPABASE_STORAGE_BUCKET}" created with allowed MIME types: image/jpeg, image/png, image/webp`);
    return;
  }

  console.log(`Current allowed MIME types in Supabase:`, bucket.allowed_mime_types);

  const { error: updateErr } = await supabaseAdmin.storage.updateBucket(SUPABASE_STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  if (updateErr) {
    console.error(`[ERROR] Failed to update bucket: ${updateErr.message}`);
    process.exit(1);
  }

  console.log(`[OK] Bucket "${SUPABASE_STORAGE_BUCKET}" updated.`);
  console.log(`Allowed MIME types: image/jpeg, image/png, image/webp (max 5 MB)`);
}

configureBucket().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
