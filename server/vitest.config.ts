import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

config({ path: '.env.test' });

if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'nossozelo-test-secret';
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
