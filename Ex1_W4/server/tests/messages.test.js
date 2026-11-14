import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const ORIGIN = 'http://localhost:5173';
let app;

beforeEach(() => {
  app = createApp({ clientOrigin: ORIGIN }); // store mới cho mỗi test → test độc lập
});

describe('GET /api/messages/:forum', () => {
  it('returns 200 with the message list of a known forum', async () => {
    const res = await request(app).get('/api/messages/nasa');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(expect.objectContaining({ id: expect.any(String), author: expect.any(String), text: expect.any(String) }));
  });

  it('returns 404 JSON for an unknown forum (notNasa)', async () => {
    const res = await request(app).get('/api/messages/notNasa');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('sends the CORS header for the configured client origin', async () => {
    const res = await request(app).get('/api/messages/nasa').set('Origin', ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });
});

describe('POST /api/messages/:forum', () => {
  it('creates a message with a UUID and timestamp (201)', async () => {
    const res = await request(app).post('/api/messages/nasa').send({ author: 'Minh Vu', text: 'Hello NASA' });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');

    const list = await request(app).get('/api/messages/nasa');
    expect(list.body.at(-1).text).toBe('Hello NASA');
  });

  it('rejects a payload missing required fields (400)', async () => {
    const res = await request(app).post('/api/messages/nasa').send({ author: 'Minh Vu' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual({ text: 'text is required' });
  });

  it('rejects whitespace-only and too-short values (400)', async () => {
    const res = await request(app).post('/api/messages/nasa').send({ author: 'A', text: '   ' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)).toEqual(['author', 'text']);
  });

  it('returns 400 JSON (not HTML) for malformed JSON', async () => {
    const res = await request(app).post('/api/messages/nasa').set('Content-Type', 'application/json').send('{"author":');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('returns 404 when posting to an unknown forum', async () => {
    const res = await request(app).post('/api/messages/notNasa').send({ author: 'Minh Vu', text: 'Hi' });
    expect(res.status).toBe(404);
  });
});
