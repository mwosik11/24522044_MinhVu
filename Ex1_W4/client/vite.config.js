import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Đọc .env ở thư mục gốc Ex1_W4 (cùng file với server)
  const env = loadEnv(mode, '..', '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000';

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      port: 5173,
      // Client gọi /api/... cùng origin; Vite chuyển tiếp sang Express
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: { modules: { classNameStrategy: 'non-scoped' } },
    },
  };
});