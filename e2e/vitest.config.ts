import { defineConfig } from 'vitest/config'

/**
 * These tests boot real servers against a real Postgres and move real files.
 * They are slower and noisier than the unit suite by design, and they must not
 * run concurrently: every scenario owns a server process, a port and a database,
 * and interleaving them makes a failure impossible to attribute.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})
