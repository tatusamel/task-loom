import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['utils/**/*.spec.ts', 'lib/**/*.spec.ts'],
    reporters: 'default',
  },
});
