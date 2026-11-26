import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Profile } from '../src/models/Profile.js';
import { Swipe } from '../src/models/Swipe.js';
import { SEED_PROFILES } from '../src/data/profiles.seed.js';

// First run downloads a MongoDB binary (~100 MB) — later runs use the cache.
let mongo;
const app = createApp();
const SESSION = '11111111-1111-4111-8111-111111111111';
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([Profile.init(), Swipe.init()]); // build unique indexes
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all([Profile.deleteMany({}), Swipe.deleteMany({})]);
  await Profile.insertMany(SEED_PROFILES);
});

describe('GET /api/profiles', () => {
  it('returns the deck ordered by `order`', async () => {
    const res = await request(app).get('/api/profiles').expect(200);
    expect(res.body).toHaveLength(SEED_PROFILES.length);
    expect(res.body.map((p) => p.order)).toEqual([...res.body.map((p) => p.order)].sort((a, b) => a - b));
    expect(res.body[0]).toMatchObject({ slug: 'minh-anh', name: 'Minh Anh' });
  });
});

describe('POST /api/swipe', () => {
  const valid = { clientId: uuid(1), sessionId: SESSION, profileSlug: 'minh-anh', action: 'LIKE' };

  it('creates a swipe and returns 201', async () => {
    const res = await request(app).post('/api/swipe').send(valid).expect(201);
    expect(res.body).toMatchObject(valid);
    expect(await Swipe.countDocuments()).toBe(1);
  });

  it('ignores unknown fields (no mass assignment)', async () => {
    await request(app).post('/api/swipe').send({ ...valid, isAdmin: true, _id: 'hack' }).expect(201);
    const doc = await Swipe.findOne({ clientId: valid.clientId }).lean();
    expect(doc.isAdmin).toBeUndefined();
  });

  it('rejects an invalid action with 400', async () => {
    const res = await request(app).post('/api/swipe').send({ ...valid, action: 'MARRY' }).expect(400);
    expect(res.body.error).toMatch(/action/);
  });

  it('rejects an unknown profile with 404', async () => {
    const res = await request(app).post('/api/swipe').send({ ...valid, profileSlug: 'ghost' }).expect(404);
    expect(res.body.error).toMatch(/ghost/);
  });

  it('rejects a second decision on the same profile in one session with 409', async () => {
    await request(app).post('/api/swipe').send(valid).expect(201);
    await request(app).post('/api/swipe').send({ ...valid, clientId: uuid(2) }).expect(409);
  });

  it('blocks NoSQL operator injection in profileSlug', async () => {
    await request(app).post('/api/swipe').send({ ...valid, profileSlug: { $ne: null } }).expect(400);
  });

  it('returns a JSON 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/swipe')
      .set('Content-Type', 'application/json')
      .send('{bad')
      .expect(400);
    expect(res.body.error).toMatch(/JSON/);
  });
});

describe('GET /api/swipes & DELETE /api/swipe/:clientId', () => {
  it('lists a session history oldest first', async () => {
    await request(app).post('/api/swipe').send({ clientId: uuid(1), sessionId: SESSION, profileSlug: 'minh-anh', action: 'NOPE' });
    await request(app).post('/api/swipe').send({ clientId: uuid(2), sessionId: SESSION, profileSlug: 'quoc-bao', action: 'LIKE' });
    const res = await request(app).get(`/api/swipes?sessionId=${SESSION}`).expect(200);
    expect(res.body.map((s) => s.profileSlug)).toEqual(['minh-anh', 'quoc-bao']);
  });

  it('requires a UUID sessionId', async () => {
    await request(app).get('/api/swipes?sessionId=abc').expect(400);
  });

  it('undo deletes the swipe and is idempotent', async () => {
    await request(app).post('/api/swipe').send({ clientId: uuid(1), sessionId: SESSION, profileSlug: 'minh-anh', action: 'LIKE' });
    await request(app).delete(`/api/swipe/${uuid(1)}?sessionId=${SESSION}`).expect(204);
    await request(app).delete(`/api/swipe/${uuid(1)}?sessionId=${SESSION}`).expect(204);
    expect(await Swipe.countDocuments()).toBe(0);
  });
});

describe('fallbacks', () => {
  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    expect(res.body.error).toMatch(/not found/);
  });
});