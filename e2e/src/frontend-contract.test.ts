import { describe, it, expect, afterEach } from 'vitest'
import { startServer, tempDataDir, removeDataDir, createDatabase, dropDatabase, seed, type ServerHandle } from './harness'

/**
 * Scenario 8 — the request sequence the decision screen actually performs.
 *
 * This is deliberately **not** a browser test. Driving a real browser would mean
 * adding Playwright to CI, and the rendering itself is already covered by the
 * component suite in `web/`. What no other test covers is the contract between
 * them: the screen reads specific fields off responses produced by the real
 * server, and the two have drifted before — `/system/db-status` shipped without
 * the `docsUrl` the screen renders a link from.
 *
 * So: the exact calls `SettingsProvider` and `ImportDecisionScreen` make, in
 * order, against a real server, asserting the exact fields they read.
 */

let running: ServerHandle | undefined
let dataDir: string | undefined
let database: string | undefined

afterEach(async () => {
  await running?.stop()
  if (dataDir) removeDataDir(dataDir)
  if (database) await dropDatabase(database)
  running = dataDir = database = undefined
})

describe('the contract the decision screen depends on', () => {
  it('carries every field the screen reads, through a full import', async () => {
    dataDir = tempDataDir('fe-contract')
    database = 'tally_e2e_fe_contract'

    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    await sqliteServer.stop()

    const connectionString = await createDatabase(database)
    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })

    // 1. The app's mount-time call. SettingsProvider routes on this rejection,
    //    so `state` has to be present on the 503 body itself.
    const settings = await running.get<{ state: string; problem: string; docsUrl: string }>('/api/v1/settings')
    expect(settings.status).toBe(503)
    expect(settings.body.state).toBe('PENDING_IMPORT')
    expect(settings.body.problem).toEqual(expect.any(String))
    expect(settings.body.docsUrl).toMatch(/#migrating-from-sqlite-to-postgres$/)

    // 2. The second call, made only in this state, for the counts the screen
    //    shows. It needs its own docsUrl: the screen prefers this response.
    const status = await running.get<{ state: string; source: Record<string, number>; docsUrl: string }>('/api/v1/system/db-status')
    expect(status.status).toBe(200)
    expect(status.body.source).toEqual({ games: 3, players: 4, sessions: 5 })
    expect(status.body.docsUrl).toMatch(/#migrating-from-sqlite-to-postgres$/)

    // 3. The button. The completion screen renders counts per table and the
    //    archive path, so both have to come back.
    const imported = await running.post<{ imported: Record<string, number>; archivedTo: string }>('/api/v1/system/import-from-sqlite')
    expect(imported.status).toBe(200)
    expect(imported.body.imported.games).toBe(3)
    expect(imported.body.imported.players).toBe(4)
    expect(imported.body.imported.sessions).toBe(5)
    expect(imported.body.archivedTo).toMatch(/tally\.db\.migrated-/)

    // 4. "Start playing" re-runs the mount-time call, which must now succeed.
    const afterImport = await running.get<{ onboarded: boolean }>('/api/v1/settings')
    expect(afterImport.status).toBe(200)
    expect(afterImport.body).toHaveProperty('onboarded')
  })

  it('gives the error screen a problem and a link when configuration is refused', async () => {
    dataDir = tempDataDir('fe-misconfigured')
    running = await startServer({ dataDir, env: { DB_HOST: 'pg.local' }, expectDegradedOrExit: true })

    // The degraded server answers the same mount-time call, with the fields the
    // error screen reads. `problem` replaces the generic offline copy and
    // `docsUrl` is the only route to remediation the screen offers.
    const settings = await running.get<{ state: string; problem: string; docsUrl: string }>('/api/v1/settings')

    expect(settings.status).toBe(503)
    expect(settings.body.state).toBe('MISCONFIGURED')
    expect(settings.body.problem).toMatch(/DB_NAME, DB_USER, DB_PASSWORD are missing/)
    expect(settings.body.docsUrl).toMatch(/#database-configuration$/)

    // The screen suppresses auto-retry on this state, so it must never appear
    // on a transient failure by accident — db-status agrees with the 503.
    const status = await running.get<{ state: string }>('/api/v1/system/db-status')
    expect(status.body.state).toBe('MISCONFIGURED')
  })
})
