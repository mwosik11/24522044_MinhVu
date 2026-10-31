
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { PUBG_VN_SQUADS } from './src/data/pubg-vn-telemetry-spec.js';

function telemetryMockPlugin() {
  return {
    name: 'pubg-telemetry-mock',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(
          req.url,
          'http://localhost',
        );

        if (!url.pathname.startsWith('/api/telemetry/')) {
          next();
          return;
        }

        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const squadId = decodeURIComponent(
          url.pathname.split('/').pop(),
        );

        const squad = PUBG_VN_SQUADS.find(
          (item) => item.id === squadId,
        );

        if (!squad) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            message: `Unknown squad ID: ${squadId}`,
          }));
          return;
        }

        let completed = false;

        const timeoutId = setTimeout(() => {
          if (res.destroyed) {
            return;
          }

          completed = true;

          res.setHeader('Content-Type', 'application/json');

          if (Math.random() < 0.35) {
            res.statusCode = 504;
            res.end(JSON.stringify({
              message: 'Satellite packet timeout. Please reconnect.',
            }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ ...squad }));
        }, 2500);

        res.on('close', () => {
          if (!completed) {
            clearTimeout(timeoutId);
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    telemetryMockPlugin(),
  ],
});
