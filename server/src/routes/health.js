import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

/**
 * GET /api/health
 * Smoke test — confirms the server is running and Supabase is reachable.
 */
router.get('/health', async (_req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      profiles_count: count
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      message: err.message
    });
  }
});

export default router;

