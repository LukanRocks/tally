import { describe, it, expect, afterEach } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'
import { startServer, tempDataDir, removeDataDir, createDatabase, dropDatabase, queryDatabase, seed, type ServerHandle } from './harness'

/** Scenarios 6 and 7 — what happens when it goes wrong. */

let running: ServerHandle | undefined
let dataDir: string | undefined
let database: string | undefined

afterEach(async () => {
  await running?.stop()
  if (dataDir) removeDataDir(dataDir)
  if (database) await dropDatabase(database)
  running = dataDir = database = undefined
})

describe('a failed import', () => {
  it('changes nothing, explains itself, and stays retryable', async () => {
    dataDir = tempDataDir('import-fail')
    database = 'tally_e2e_import_fail'

    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    await sqliteServer.stop()

    const connectionString = await createDatabase(database)
    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })
    expect((await running.get<{ state: string }>('/api/v1/system/db-status')).body.state).toBe('PENDING_IMPORT')

    // Break a table the boot path does not read, so the failure lands mid-import
    // rather than at startup. players and games insert before session_results,
    // which makes this a real test of the rollback and not just of the error.
    await queryDatabase(database, 'ALTER TABLE session_results DROP COLUMN rank')

    const failed = await running.post<{ error: string }>('/api/v1/system/import-from-sqlite')
    expect(failed.status).toBe(500)

    // One sentence, not Drizzle's dump of the statement and every bound
    // parameter — those parameters are the user's own rows.
    expect(failed.body.error).toMatch(/^The import failed, so nothing was changed — /)
    expect(failed.body.error).not.toMatch(/Failed query|params:/)

    // Rolled back: the tables that inserted before the failure are empty again.
    const counts = await queryDatabase<{ games: number; players: number }>(database, 'SELECT (SELECT COUNT(*)::int FROM games) games, (SELECT COUNT(*)::int FROM players) players')
    expect(counts[0]).toEqual({ games: 0, players: 0 })

    // The source file is untouched and still under its live name, so the user
    // can fix the cause and retry, or revert to SQLite entirely.
    expect(existsSync(join(dataDir, 'tally.db'))).toBe(true)

    const status = await running.get<{ state: string; lastError: string }>('/api/v1/system/db-status')
    expect(status.body.state).toBe('PENDING_IMPORT')
    expect(status.body.lastError).toMatch(/nothing was changed/)

    // And it is in the log, not only on a screen the user can navigate away from.
    expect(running.output()).toMatch(/Import from SQLite failed/)
  })
})

describe('a refused configuration', () => {
  // NOTE: this deliberately asserts the *current* behaviour, which changed in
  // #110. Configuration errors no longer exit — the container stays up and
  // explains itself in the browser, because someone who just edited a compose
  // file is looking at a tab, not at `docker logs`. Every other failure class
  // still exits.
  it.each([
    ['a partial discrete set', { DB_HOST: 'pg.local' }, /DB_NAME, DB_USER, DB_PASSWORD are missing/],
    ['both styles at once', { DATABASE_URL: 'postgres://u:p@h/db', DB_HOST: 'other' }, /both set\. Use one or the other/],
    ['an invalid SSL mode', { DATABASE_URL: 'postgres://u:p@h/db', DB_SSL: 'requrie' }, /DB_SSL is "requrie"/],
    ['a non-numeric port', { DB_HOST: 'h', DB_NAME: 'n', DB_USER: 'u', DB_PASSWORD: 'p', DB_PORT: '54r32' }, /DB_PORT is "54r32"/],
  ])('serves an explanation for %s instead of crashing', async (_label, env, expected) => {
    dataDir = tempDataDir('misconfigured')
    running = await startServer({ dataDir, env, expectDegradedOrExit: true })

    expect(running.exitCode(), 'the process should still be running').toBeNull()

    const status = await running.get<{ state: string; problem: string; docsUrl: string }>('/api/v1/system/db-status')
    expect(status.status).toBe(200)
    expect(status.body.state).toBe('MISCONFIGURED')
    expect(status.body.problem).toMatch(expected)
    expect(status.body.docsUrl).toMatch(/^https:\/\/github\.com\/LukanRocks\/tally#/)

    // The data API is unavailable, and says why rather than 404ing.
    const games = await running.get<{ state: string }>('/api/v1/games')
    expect(games.status).toBe(503)
    expect(games.body.state).toBe('MISCONFIGURED')

    // The same explanation reaches the log, with no stack trace.
    expect(running.output()).toMatch(/Tally could not start/)
    expect(running.output()).toMatch(expected)
    expect(running.output()).not.toMatch(/ {4}at /)
  })

  // The rule that makes the whole design safe: a typo must never quietly land
  // the user in a fresh empty SQLite file while their real rows sit elsewhere.
  it('never falls back to SQLite', async () => {
    dataDir = tempDataDir('no-fallback')
    running = await startServer({ dataDir, env: { DB_HOST: 'pg.local' }, expectDegradedOrExit: true })

    expect(existsSync(join(dataDir, 'tally.db'))).toBe(false)
  })

  it('does not leak the password into the explanation or the log', async () => {
    dataDir = tempDataDir('no-leak')
    running = await startServer({
      dataDir,
      env: { DATABASE_URL: 'postgres://tally:hunter2@h/db', DB_HOST: 'other', DB_PASSWORD: 'hunter2' },
      expectDegradedOrExit: true,
    })

    const status = await running.get<unknown>('/api/v1/system/db-status')

    expect(JSON.stringify(status.body)).not.toMatch(/hunter2/)
    expect(running.output()).not.toMatch(/hunter2/)
  })
})

describe('an unreachable database', () => {
  // Distinct from a refused configuration on purpose. There is nothing for the
  // user to fix in a compose file here, and the restart policy is what recovers
  // it once the database appears — so this class must exit rather than sit up
  // looking healthy.
  it('exits non-zero rather than serving', async () => {
    dataDir = tempDataDir('unreachable')
    running = await startServer({
      dataDir,
      env: { DATABASE_URL: 'postgres://tally:tally@127.0.0.1:1/tally' },
      expectDegradedOrExit: true,
    })

    expect(running.exitCode()).not.toBeNull()
    expect(running.exitCode()).not.toBe(0)
    expect(running.output()).toMatch(/Tally could not start/)
    expect(running.output()).toMatch(/refused the connection|could not be found|timed out/)
  })
})
