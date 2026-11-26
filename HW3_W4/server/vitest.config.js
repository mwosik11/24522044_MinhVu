import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Load server/.env (if present) so tests can see MONGOMS_SYSTEM_BINARY.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 180_000,
  },
});