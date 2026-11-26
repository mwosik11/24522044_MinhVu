import { Router } from 'express';
import { Profile } from '../models/Profile.js';
import { Swipe } from '../models/Swipe.js';
import { HttpError } from '../middleware/errorHandler.js';

const UUID = /^[0-9a-f-]{36}$/i;
const PUBLIC_FIELDS = { _id: 0, clientId: 1, sessionId: 1, profileSlug: 1, action: 1, createdAt: 1 };

function requireSessionId(value) {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new HttpError(400, 'sessionId must be a UUID');
  }
  return value;
}

/** Mounted at /api/swipes — collection reads. */
export const swipesRouter = Router();

// GET /api/swipes?sessionId=<uuid> — restore a session's history (oldest first).
swipesRouter.get('/', async (req, res) => {
  const sessionId = requireSessionId(req.query.sessionId);
  const swipes = await Swipe.find({ sessionId }, PUBLIC_FIELDS).sort({ createdAt: 1, _id: 1 }).lean();
  res.json(swipes);
});

/** Mounted at /api/swipe — single-swipe writes. */
export const swipeRouter = Router();

// POST /api/swipe — record one decision.
swipeRouter.post('/', async (req, res) => {
  // Whitelist fields: never pass req.body straight to Model.create (mass assignment).
  const { clientId, sessionId, profileSlug, action } = req.body ?? {};

  // Reject non-strings before querying: {"$ne": null} would be a NoSQL injection.
  if (typeof profileSlug !== 'string') throw new HttpError(400, 'profileSlug must be a string');
  const profileExists = await Profile.exists({ slug: profileSlug });
  if (!profileExists) throw new HttpError(404, `Unknown profile "${profileSlug}"`);

  const record = await Swipe.create({ clientId, sessionId, profileSlug, action });
  res.status(201).json({
    clientId: record.clientId,
    sessionId: record.sessionId,
    profileSlug: record.profileSlug,
    action: record.action,
    createdAt: record.createdAt,
  });
});

// DELETE /api/swipe/:clientId?sessionId=<uuid> — undo. Idempotent: 204 even if already gone.
swipeRouter.delete('/:clientId', async (req, res) => {
  const sessionId = requireSessionId(req.query.sessionId);
  await Swipe.deleteOne({ clientId: req.params.clientId, sessionId });
  res.status(204).end();
});