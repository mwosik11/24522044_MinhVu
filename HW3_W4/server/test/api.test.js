import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Player } from '../src/models/Player.js';
import { Case } from '../src/models/Case.js';
import { Appeal } from '../src/models/Appeal.js';
import { SEED_PLAYERS, buildSeedCases } from '../src/data/seed.data.js';
import { computeMatrix } from '../../shared/matrix.js';
import { validateAppeal } from '../../shared/appealRules.js';

let mongo;
const app = createApp();

const VALID_APPEAL = {
  email: 'himass@team.gg',
  grounds: 'disproportionate-sanction',
  contestedCodes: ['V1'],
  statement: 'A 365-day ban for 40 % evidence strength is five times the published guideline.',
  evidenceUrl: '',
  acknowledged: true,
};

// The exact context the server must derive for Himass — used to prove validation parity.
const himassCase = buildSeedCases().find((c) => c.playerId === 'himass');
const HIMASS_CONTEXT = {
  violationCodes: himassCase.violations.map((v) => v.code),
  excessiveCodes: computeMatrix(himassCase.violations).totals.excessiveCodes,
};

const postAppeal = (playerId, body) => request(app).post(`/api/dossiers/${playerId}/appeals`).send(body);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([Player.init(), Case.init(), Appeal.init()]);
}, 180_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all([Player.deleteMany({}), Case.deleteMany({}), Appeal.deleteMany({})]);
  await Player.insertMany(SEED_PLAYERS);
  await Case.insertMany(buildSeedCases());
});

describe('GET /api/time', () => {
  it('returns the server clock and disables caching', async () => {
    const before = Date.now();
    const res = await request(app).get('/api/time').expect(200);
    expect(res.body.now).toBeGreaterThanOrEqual(before);
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('GET /api/players', () => {
  it('lists players with public fields only', async () => {
    const res = await request(app).get('/api/players').expect(200);
    expect(res.body).toEqual([
      { playerId: 'himass', handle: 'Himass', team: 'S3T Phoenix' },
      { playerId: 'tanvuu', handle: 'TanVuu', team: 'S3T Phoenix' },
    ]);
  });
});

describe('GET /api/dossiers/:playerId', () => {
  it('returns player, case and no appeal yet', async () => {
    const res = await request(app).get('/api/dossiers/himass').expect(200);
    expect(res.body.player).toMatchObject({ playerId: 'himass', handle: 'Himass' });
    expect(res.body.case.caseRef).toBe('FP-2026-0417');
    expect(res.body.case.violations).toHaveLength(3);
    expect(Date.parse(res.body.case.appealDeadline)).toBeGreaterThan(Date.now());
    expect(res.body.appeal).toBeNull();
  });

  it('returns a JSON 404 for an unknown player', async () => {
    const res = await request(app).get('/api/dossiers/ghost').expect(404);
    expect(res.body.error).toMatch(/ghost/);
  });
});

describe('POST /api/dossiers/:playerId/appeals', () => {
  it('creates an appeal and shows it in the dossier', async () => {
    const res = await postAppeal('himass', VALID_APPEAL).expect(201);
    expect(res.body).toMatchObject({ playerId: 'himass', caseRef: 'FP-2026-0417', contestedCodes: ['V1'] });

    const dossier = await request(app).get('/api/dossiers/himass').expect(200);
    expect(dossier.body.appeal.grounds).toBe('disproportionate-sanction');
  });

  it('rejects invalid input with exactly the errors the client computes (parity)', async () => {
    const body = { ...VALID_APPEAL, email: 'nope', statement: 'too short' };
    const res = await postAppeal('himass', body).expect(400);
    expect(res.body.errors).toEqual(validateAppeal(body, HIMASS_CONTEXT));
    expect(Object.keys(res.body.errors)).toEqual(['email', 'statement']);
  });

  it('enforces the cross-field rule on the server too', async () => {
    const res = await postAppeal('himass', { ...VALID_APPEAL, contestedCodes: ['V2'] }).expect(400);
    expect(res.body.errors.contestedCodes).toMatch(/EXCESSIVE/);
  });

  it('allows only one appeal per case (409)', async () => {
    await postAppeal('himass', VALID_APPEAL).expect(201);
    await postAppeal('himass', VALID_APPEAL).expect(409);
  });

  it('rejects appeals after the SLA deadline (410)', async () => {
    await Case.updateOne({ playerId: 'himass' }, { appealDeadline: new Date(Date.now() - 1000) });
    const res = await postAppeal('himass', VALID_APPEAL).expect(410);
    expect(res.body.error).toMatch(/deadline/);
  });

  it('returns 404 for an unknown player', async () => {
    await postAppeal('ghost', VALID_APPEAL).expect(404);
  });

  it('ignores fields the client must not control (no mass assignment)', async () => {
    await postAppeal('himass', { ...VALID_APPEAL, playerId: 'tanvuu', caseRef: 'FP-0000-0000', isAdmin: true }).expect(201);
    const saved = await Appeal.findOne({}).lean();
    expect(saved).toMatchObject({ playerId: 'himass', caseRef: 'FP-2026-0417' });
    expect(saved.isAdmin).toBeUndefined();
  });
});

describe('fallbacks', () => {
  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    expect(res.body.error).toMatch(/not found/);
  });
});