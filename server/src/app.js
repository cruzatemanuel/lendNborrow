import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { PORT, COOKIE_SECRET } from './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import itemsRouter from './routes/items.js';
import requestsRouter from './routes/requests.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root of project containing HTML, css, js, assets
const rootDir = path.resolve(__dirname, '../../');

const app = express();

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

// API routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static frontend files from project root
app.use(express.static(rootDir, {
  extensions: ['html']
}));

// Route aliases / compatibility rewrites for friendly URLs
app.get('/login', (req, res) => res.redirect('/signin.html'));
app.get('/register', (req, res) => res.redirect('/signup.html'));
app.get('/login.html', (req, res) => res.redirect('/signin.html'));
app.get('/register.html', (req, res) => res.redirect('/signup.html'));
app.get('/add-item.html', (req, res) => res.redirect('/listing-form.html'));
app.get('/edit-item.html', (req, res) => res.redirect('/listing-form.html'));
app.get('/incoming-requests.html', (req, res) => res.redirect('/my-listings.html'));
app.get('/my-requests.html', (req, res) => res.redirect('/my-borrows.html'));
app.get('/borrowed.html', (req, res) => res.redirect('/my-borrows.html'));

// Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// 404 for unhandled API calls
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Fallback to 404.html or generic 404 for client requests
app.use((req, res) => {
  const custom404 = path.join(rootDir, '404.html');
  res.status(404).sendFile(custom404, (err) => {
    if (err) {
      res.status(404).send('404 Not Found');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

// Boot server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 lendNborrow server running at http://localhost:${PORT}`);
    console.log(`   Health check endpoint: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;

