// lendNborrow — Express backend entry point
// Loads env vars from server/.env, serves the public frontend, exposes /api/health

'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Fail fast if required env vars are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[FATAL] Missing required environment variables. ' +
      'Copy server/.env.example → server/.env and fill in SUPABASE_URL and SUPABASE_ANON_KEY.'
  );
  process.exit(1);
}

// Server-side Supabase client (anon key; service-role key used where needed)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();

// --- Middleware -----------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false, // dev frontend uses CDN scripts
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static frontend -------------------------------------------------------
// Serve the public/ directory (index.html, js/, css/, assets/) at the root.
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// --- API routes ------------------------------------------------------------

// Health check: verifies Express + Supabase connectivity
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: 'error',
        supabase: 'disconnected',
        detail: error.message,
      });
    }

    return res.json({
      status: 'ok',
      supabase: 'connected',
      uptime: process.uptime(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      supabase: 'disconnected',
      detail: err.message,
    });
  }
});

// --- 404 fallback ----------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

// --- Error handler ---------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// --- Start -----------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`lendNborrow server running → http://localhost:${PORT}`);
  console.log(`Health check → http://localhost:${PORT}/api/health`);
});

module.exports = app;