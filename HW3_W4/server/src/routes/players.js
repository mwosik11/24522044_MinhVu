import { Router } from 'express';
import { Player } from '../models/Player.js';

export const playersRouter = Router();

// GET /api/players — sidebar list, public fields only.
playersRouter.get('/', async (_req, res) => {
  const players = await Player.find({}, { _id: 0, playerId: 1, handle: 1, team: 1 }).sort({ handle: 1 }).lean();
  res.json(players);
});