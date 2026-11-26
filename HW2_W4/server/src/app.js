import express from 'express';
import { profilesRouter } from './routes/profiles.js';
import { swipeRouter, swipesRouter } from './routes/swipes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

/** Build the Express app without connecting or listening — used by index.js and by tests. */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/profiles', profilesRouter);
  app.use('/api/swipe', swipeRouter); // POST /, DELETE /:clientId
  app.use('/api/swipes', swipesRouter); // GET /?sessionId=

  app.use(notFound);
  app.use(errorHandler);
  return app;
}