import { randomUUID } from 'node:crypto';

/**
 * In-memory store (Exercise chưa cần MongoDB — Homework mới dùng Mongoose 8).
 * Chỉ seed 2 forum: 'notNasa' CỐ Ý không tồn tại để kiểm chứng nhánh lỗi 404.
 */
export function createMessageStore() {
  const forums = new Map([
    ['nasa', [
      { id: randomUUID(), author: 'Mission Control', text: 'Artemis telemetry nominal.', timestamp: '2026-11-01T08:00:00.000Z' },
      { id: randomUUID(), author: 'Astro Lan', text: 'Docking window opens at T+42m.', timestamp: '2026-11-01T08:05:00.000Z' },
    ]],
    ['esports-tribunal', [
      { id: randomUUID(), author: 'Referee Bot', text: 'Appeal #12 is under review.', timestamp: '2026-11-02T13:00:00.000Z' },
    ]],
  ]);

  return {
    hasForum: (forum) => forums.has(forum),
    /** Trả bản sao để caller không mutate store */
    getMessages: (forum) => [...(forums.get(forum) ?? [])],
    addMessage: (forum, { author, text }) => {
      const message = { id: randomUUID(), author: author.trim(), text: text.trim(), timestamp: new Date().toISOString() };
      forums.set(forum, [...forums.get(forum), message]);
      return message;
    },
  };
}