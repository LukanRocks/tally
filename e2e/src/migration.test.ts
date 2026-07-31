import { describe, it, expect, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { startServer, tempDataDir, removeDataDir, createDatabase, dropDatabase, queryDatabase, seed, type ServerHandle } from './harness'

/** Scenarios 3, 4 and 5 — the migration itself, both answers, and the archive. */

let running: ServerHandle | undefined
let dataDir: string | undefined
let database: string | undefined

afterEach(async () => {
  await running?.stop()
  if (dataDir) removeDataDir(dataDir)
  if (database) await dropDatabase(database)
  running = dataDir = database = undefined
})

const archivesIn = (dir: string): string[] => readdirSync(dir).filter((file) => file.includes('.migrated-') && !file.endsWith('-wal') && !file.endsWith('-shm'))

describe('migrating an existing SQLite install to Postgres', () => {
  it('gates, imports, and leaves the API byte-identical', async () => {
    dataDir = tempDataDir('migrate-accept')
    database = 'tally_e2e_migrate_accept'

    // 1. A populated SQLite install, seeded through its own API.
    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    const before = await sqliteServer.get<unknown>('/api/v1/stats/leaderboard')
    await sqliteServer.stop()

    // 2. Restarted pointed at an empty Postgres, same data directory.
    const connectionString = await createDatabase(database)
    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })

    const status = await running.get<{ state: string; source: { games: number; players: number; sessions: number } }>('/api/v1/system/db-status')
    expect(status.body.state).toBe('PENDING_IMPORT')
    expect(status.body.source).toEqual({ games: 3, players: 4, sessions: 5 })

    // 3. The gate is hard. Serving here would let someone write into the empty
    //    Postgres while their real data sat in the file, leaving neither
    //    database authoritative.
    for (const path of ['/api/v1/games', '/api/v1/players', '/api/v1/sessions', '/api/v1/settings', '/api/v1/stats/leaderboard']) {
      const gated = await running.get<{ state: string }>(path)
      expect(gated.status, `${path} should be gated`).toBe(503)
      expect(gated.body.state).toBe('PENDING_IMPORT')
    }

    const blockedWrite = await running.post('/api/v1/players', { name: 'Sneaky' })
    expect(blockedWrite.status).toBe(503)

    // 4. Import.
    const imported = await running.post<{ imported: Record<string, number>; archivedTo: string }>('/api/v1/system/import-from-sqlite')
    expect(imported.status).toBe(200)
    expect(imported.body.imported).toMatchObject({ games: 3, players: 4, sessions: 5, session_results: 15 })

    // 5. The whole point of this scenario. Running the steps without comparing
    //    output would have passed while the settings-singleton collision was
    //    live in Phase 4.
    const after = await running.get<unknown>('/api/v1/stats/leaderboard')
    expect(JSON.stringify(after.body)).toBe(JSON.stringify(before.body))

    // 6. Ids came across explicitly, so the identity sequences are still at 1
    //    unless setval ran. This is the assertion that catches that.
    const created = await running.post<{ id: number }>('/api/v1/games', { name: 'Post-Migration Game' })
    expect(created.status).toBe(201)
    expect(created.body.id).toBe(4)

    expect((await running.get<{ state: string }>('/api/v1/system/db-status')).body.state).toBe('READY')
  })

  it('does not offer the import a second time', async () => {
    dataDir = tempDataDir('migrate-once')
    database = 'tally_e2e_migrate_once'

    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    await sqliteServer.stop()

    const connectionString = await createDatabase(database)
    const migrating = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })
    await migrating.post('/api/v1/system/import-from-sqlite')
    await migrating.stop()

    // Restart. The provenance marker in _tally_meta is what stops a user who
    // migrated and then deleted everything from being prompted forever.
    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })

    expect((await running.get<{ state: string }>('/api/v1/system/db-status')).body.state).toBe('READY')
    expect((await running.get('/api/v1/games')).status).toBe(200)

    const marker = await queryDatabase<{ value: string }>(database, "SELECT value FROM _tally_meta WHERE key = 'imported_from_sqlite_at'")
    expect(marker).toHaveLength(1)
  })

  it('holds the gate indefinitely when the user does not answer', async () => {
    dataDir = tempDataDir('migrate-decline')
    database = 'tally_e2e_migrate_decline'

    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    await sqliteServer.stop()

    const connectionString = await createDatabase(database)

    // Two restarts without answering. The gate must not weaken or time out.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const gated = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })

      expect((await gated.get<{ state: string }>('/api/v1/system/db-status')).body.state).toBe('PENDING_IMPORT')
      expect((await gated.get('/api/v1/games')).status).toBe(503)

      await gated.stop()
    }

    // Nothing was written to Postgres while the user was deciding.
    const games = await queryDatabase<{ count: string }>(database, 'SELECT COUNT(*)::int AS count FROM games')
    expect(Number(games[0].count)).toBe(0)

    // Declining means removing the variables. The SQLite install must come back
    // untouched — this is the escape hatch the decision screen promises.
    running = await startServer({ dataDir })

    expect((await running.get<{ state: string; dialect: string }>('/api/v1/system/db-status')).body).toMatchObject({ state: 'READY', dialect: 'sqlite' })
    expect((await running.get<unknown[]>('/api/v1/games')).body).toHaveLength(3)
    expect((await running.get<unknown[]>('/api/v1/sessions')).body).toHaveLength(5)
    expect(archivesIn(dataDir)).toHaveLength(0)
  })
})

describe('the archived SQLite file', () => {
  // Tally runs SQLite in WAL mode, so a live database can hold most of its
  // content in tally.db-wal rather than tally.db. Archiving the main file alone
  // produced a 4 KB snapshot beside a 290 KB orphaned WAL — worthless precisely
  // when the user needs it, on a revert.
  it('opens standalone and contains every row', async () => {
    dataDir = tempDataDir('archive')
    database = 'tally_e2e_archive'

    const sqliteServer = await startServer({ dataDir })
    await seed(sqliteServer)
    await sqliteServer.stop()

    const connectionString = await createDatabase(database)
    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })
    const imported = await running.post<{ archivedTo: string }>('/api/v1/system/import-from-sqlite')

    const archive = imported.body.archivedTo
    expect(existsSync(archive)).toBe(true)
    // Renamed, never deleted: the live file is gone from its old name.
    expect(existsSync(join(dataDir, 'tally.db'))).toBe(false)

    // A checkpointed archive is not a near-empty stub.
    expect(statSync(archive).size).toBeGreaterThan(20_000)

    // Opened with no sidecars alongside it — the real test of a revert.
    const handle = new Database(archive, { readonly: true, fileMustExist: true })
    try {
      const count = (table: string) => (handle.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c

      expect(count('games')).toBe(3)
      expect(count('players')).toBe(4)
      expect(count('sessions')).toBe(5)
      expect(count('session_results')).toBe(15)
    } finally {
      handle.close()
    }

    // Sidecars moved alongside the archive rather than being orphaned under the
    // old name, so the backup is self-contained.
    expect(existsSync(join(dataDir, 'tally.db-wal'))).toBe(false)
  })
})
