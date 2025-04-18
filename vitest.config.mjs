import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['src/lib/**/*.ts'],
      thresholds: {
        100: true,
      },
    },
  },
});
