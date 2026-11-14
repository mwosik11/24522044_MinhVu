import express from 'express';
import cors from 'cors';
import { createMessageStore } from './store.js';
import { validateMessage } from './validateMessage.js';

/**
 * Factory tạo app (KHÔNG listen) → supertest gọi trực tiếp, không cần mở port.
 * @param {{ store?: ReturnType<typeof createMessageStore>, clientOrigin?: string, delayMs?: number }} [options]
 */
export function createApp({
  store = createMessageStore(),
  clientOrigin = 'http://localhost:5173',
  delayMs = 0,
} = {}) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '10kb' }));

  // Giả lập độ trễ mạng (API_DELAY_MS) để quan sát AbortController khi đổi kênh nhanh
  if (delayMs > 0) {
    app.use((_req, _res, next) => setTimeout(next, delayMs));
  }

  const requireForum = (req, res, next) => {
    if (!store.hasForum(req.params.forum)) {
      return res.status(404).json({ error: `Forum '${req.params.forum}' not found` });
    }
    next();
  };

  app.get('/api/messages/:forum', requireForum, (req, res) => {
    res.json(store.getMessages(req.params.forum));
  });

  app.post('/api/messages/:forum', requireForum, (req, res) => {
    const errors = validateMessage(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Invalid message payload', fields: errors });
    }
    const created = store.addMessage(req.params.forum, req.body);
    res.status(201).json(created);
  });

  // Mọi lỗi (JSON hỏng, payload quá lớn…) trả JSON thay vì HTML stack trace
  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  });

  return app;
}