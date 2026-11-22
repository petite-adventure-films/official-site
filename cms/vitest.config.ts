import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Release integration tests build the same Astro project and share its .astro directory.
    fileParallelism: false,
    include: ['worker/**/*.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});
