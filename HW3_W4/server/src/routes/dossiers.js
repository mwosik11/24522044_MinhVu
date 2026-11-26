import { Router } from 'express';
import { Player } from '../models/Player.js';
import { Case } from '../models/Case.js';
import { Appeal } from '../models/Appeal.js';
import { HttpError } from '../middleware/errorHandler.js';
import { computeMatrix } from '../../../shared/matrix.js';
import { normalizeAppeal, validateAppeal } from '../../../shared/appealRules.js';

export const dossiersRouter = Router();

const HIDDEN = { _id: 0, createdAt: 0, updatedAt: 0 };

async function findPlayerOr404(playerId) {
  const player = await Player.findOne({ playerId }, HIDDEN).lean();
  if (!player) throw new HttpError(404, `No dossier for player "${playerId}"`);
  return player;
}

const toPublicAppeal = (appeal) => ({
  playerId: appeal.playerId,
  caseRef: appeal.caseRef,
  email: appeal.email,
  grounds: appeal.grounds,
  contestedCodes: appeal.contestedCodes,
  statement: appeal.statement,
  evidenceUrl: appeal.evidenceUrl,
  createdAt: appeal.createdAt,
});

// GET /api/dossiers/:playerId — everything the dossier page needs in one request.
dossiersRouter.get('/:playerId', async (req, res) => {
  const player = await findPlayerOr404(req.params.playerId);
  const kase = await Case.findOne({ playerId: player.playerId }, HIDDEN).lean();
  const appeal = kase ? await Appeal.findOne({ caseRef: kase.caseRef }).lean() : null;
  res.json({ player, case: kase, appeal: appeal ? toPublicAppeal(appeal) : null });
});

// POST /api/dossiers/:playerId/appeals
dossiersRouter.post('/:playerId/appeals', async (req, res) => {
  const player = await findPlayerOr404(req.params.playerId);
  const kase = await Case.findOne({ playerId: player.playerId }).lean();
  if (!kase) throw new HttpError(404, `No open case for player "${player.playerId}"`);

  // The server clock is the authority for the SLA, never the client.
  if (Date.now() > kase.appealDeadline.getTime()) {
    throw new HttpError(410, 'The appeal deadline has passed');
  }
  if (await Appeal.exists({ caseRef: kase.caseRef })) {
    throw new HttpError(409, 'An appeal has already been filed for this case');
  }

  // Same rules + same context as the React form → identical error messages (parity).
  const context = {
    violationCodes: kase.violations.map((v) => v.code),
    excessiveCodes: computeMatrix(kase.violations).totals.excessiveCodes,
  };
  const body = req.body ?? {};
  const errors = validateAppeal(body, context);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Invalid appeal', errors });
  }

  // normalizeAppeal whitelists fields; playerId/caseRef come from the server, not the body.
  const appeal = await Appeal.create({ ...normalizeAppeal(body), playerId: player.playerId, caseRef: kase.caseRef });
  res.status(201).json(toPublicAppeal(appeal));
});