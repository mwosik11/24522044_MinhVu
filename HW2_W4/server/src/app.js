import express from 'express';

/** Build the Express app without connecting or listening — used by index.js and by tests. */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  return app;
}