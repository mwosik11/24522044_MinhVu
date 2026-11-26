import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:4000';
  return {
    plugins: [react()],
    // Same-origin /api in dev & preview → no CORS configuration needed on the server.
    server: { proxy: { '/api': apiTarget } },
    preview: { proxy: { '/api': apiTarget } },
    build: { target: 'es2022' },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
});