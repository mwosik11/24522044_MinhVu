import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// HW3 root (one level above client/) — lets the dev server serve ../shared.
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // IPv4 on purpose: `localhost` may resolve to ::1 and the proxy returns 502 (see HW2 audit).
  const apiTarget = env.API_PROXY_TARGET || 'http://127.0.0.1:4100';
  return {
    plugins: [react()],
    server: {
      proxy: { '/api': apiTarget },
      fs: { allow: [projectRoot] },
    },
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