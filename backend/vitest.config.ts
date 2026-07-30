import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    // Default isolation gives each test file its own module registry, which is
    // what keeps per-file SQLite databases from leaking into each other.
    isolate: true,
  },
})
