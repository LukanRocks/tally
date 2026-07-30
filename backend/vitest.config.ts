import { defineConfig } from 'vitest/config'

// The Postgres pass shares one database across all test files, so they must not
// run concurrently. SQLite gives each file its own temp file (see test/setup.ts)
// and can stay parallel.
const isPostgres = Boolean(process.env.DATABASE_URL)

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    // Default isolation gives each test file its own module registry, which is
    // what keeps per-file SQLite databases from leaking into each other.
    isolate: true,
    fileParallelism: !isPostgres,
  },
})
