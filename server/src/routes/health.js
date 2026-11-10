import { Router } from 'express';
import { isSupabaseConfigured } from '../config/env.js';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return res.status(503).json({
      ok: false,
      supabase: 'not configured'
    });
  }

  try {
    // Quick probe to verify Supabase connection
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return res.status(503).json({
        ok: false,
        supabase: 'connection error',
        message: error.message
      });
    }
    return res.status(200).json({
      ok: true,
      supabase: 'connected'
    });
  } catch (err) {
    return res.status(503).json({
      ok: false,
      supabase: 'unreachable',
      message: err.message
    });
  }
});

export default router;

