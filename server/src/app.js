import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Route imports ──────────────────────────────────────────
import healthRouter   from './routes/health.js';
import authRouter     from './routes/auth.js';
import itemsRouter    from './routes/items.js';
import requestsRouter from './routes/requests.js';
import adminRouter    from './routes/admin.js';
import analyticsRouter from './routes/analytics.js';

const app = express();

// ── Global middleware ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const frontendRoot = path.join(__dirname, '../../');
const pageNames = new Set([
  'index', 'login', 'register', 'browse', 'item', 'add-item', 'edit-item',
  'my-listings', 'my-requests', 'incoming-requests', 'borrowed', 'dashboard',
  'profile', '404',
]);
const staticOptions = { dotfiles: 'deny', index: false };

// ── API routes ─────────────────────────────────────────────
app.use('/api',           healthRouter);
app.use('/api/auth',      authRouter);
app.use('/api/items',     itemsRouter);
app.use('/api/requests',  requestsRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/analytics', analyticsRouter);

// ── API 404 (must come after all /api routes) ──────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Frontend assets and pages ───────────────────────────────
// Only approved public paths are served. This prevents server source, SQL,
// and documentation files from being exposed by the static server.
app.use('/css', express.static(path.join(frontendRoot, 'css'), staticOptions));
app.use('/js', express.static(path.join(frontendRoot, 'js'), staticOptions));
app.use('/assets', express.static(path.join(frontendRoot, 'assets'), staticOptions));

app.get(['/', '/index.html'], (_req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

app.get('/:page.html', (req, res, next) => {
  if (!pageNames.has(req.params.page)) return next();
  res.sendFile(path.join(frontendRoot, `${req.params.page}.html`));
});

// ── HTML fallback — serve 404.html for unknown pages ───────
app.use((_req, res) => {
  res.status(404).sendFile(path.join(frontendRoot, '404.html'));
});

// ── Global error handler ───────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  lendNborrow server running at http://localhost:${PORT}\n`);
});

export default app;

