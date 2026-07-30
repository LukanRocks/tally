import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll } from 'vitest'

// Runs once per test file, before that file's imports are evaluated. This is the
// only chance to point DATA_DIR somewhere disposable: src/db opens the SQLite
// file at module load, so by the time a test imports it the path is already
// fixed. Vitest's default isolation gives each file its own module registry, so
// each file gets its own database and they cannot see each other's writes.
const dataDir = mkdtempSync(join(tmpdir(), 'tally-test-'))

process.env.DATA_DIR = dataDir
process.env.NODE_ENV = 'test'

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true })
})
