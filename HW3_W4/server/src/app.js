import express from 'express';

/** Build the Express app without connecting or listening — used by index.js and by tests. */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // Authoritative clock for the SLA countdown (client measures its offset against this).
  app.get('/api/time', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ now: Date.now() });
  });
  return app;
}