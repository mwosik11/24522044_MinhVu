import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const delayMs = Number(process.env.API_DELAY_MS ?? 0);

createApp({ clientOrigin, delayMs }).listen(port, () => {
  console.log(`API ready on http://localhost:${port} (CORS: ${clientOrigin}, delay: ${delayMs}ms)`);
});