import { Router } from 'express';
import { Profile } from '../models/Profile.js';

export const profilesRouter = Router();

// GET /api/profiles — whole deck, ordered. `.lean()` returns plain objects (faster reads).
// Express 5 forwards rejected promises to the error handler: no try/catch needed here.
profilesRouter.get('/', async (_req, res) => {
  const profiles = await Profile.find({}, { createdAt: 0, updatedAt: 0 }).sort({ order: 1 }).lean();
  res.json(profiles);
});