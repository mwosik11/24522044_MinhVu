import mongoose from 'mongoose';
import { createApp } from './app.js';

// 1. Environment variable security guard — fail fast, never fall back to a hard-coded URI.
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing — copy server/.env.example to server/.env');
const PORT = Number(process.env.PORT) || 4000;

// 2. Modern connection syntax: no useNewUrlParser / useUnifiedTopology in Mongoose 8.
await mongoose.connect(process.env.MONGODB_URI);
console.log(`MongoDB connected: ${mongoose.connection.name}`);

const server = createApp().listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// 3. Graceful shutdown (Ctrl+C / container stop).
async function shutdown(signal) {
  console.log(`${signal} received, shutting down…`);
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);