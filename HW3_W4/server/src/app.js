import express from 'express';
import { playersRouter } from './routes/players.js';
import { dossiersRouter } from './routes/dossiers.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

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
  app.use('/api/players', playersRouter);
  app.use('/api/dossiers', dossiersRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}