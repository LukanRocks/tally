import { describe, it, expect, afterEach } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'
import { startServer, tempDataDir, removeDataDir, createDatabase, dropDatabase, queryDatabase, seed, type ServerHandle } from './harness'

/** Scenarios 1 and 2 — a fresh install on either database actually works. */

let running: ServerHandle | undefined
let dataDir: string | undefined
let database: string | undefined

afterEach(async () => {
  await running?.stop()
  if (dataDir) removeDataDir(dataDir)
  if (database) await dropDatabase(database)
  running = dataDir = database = undefined
})

describe('a fresh SQLite install', () => {
  it('boots with no configuration at all, and round-trips data', async () => {
    dataDir = tempDataDir('sqlite-fresh')
    running = await startServer({ dataDir })

    const status = await running.get<{ state: string; dialect: string }>('/api/v1/system/db-status')
    expect(status.body).toMatchObject({ state: 'READY', dialect: 'sqlite' })

    // The zero-config promise: no env vars, and a database file appears.
    expect(existsSync(join(dataDir, 'tally.db'))).toBe(true)

    await seed(running)

    const games = await running.get<unknown[]>('/api/v1/games')
    const players = await running.get<unknown[]>('/api/v1/players')
    const sessions = await running.get<unknown[]>('/api/v1/sessions')

    expect(games.body).toHaveLength(3)
    expect(players.body).toHaveLength(4)
    expect(sessions.body).toHaveLength(5)
  })

  it('keeps its data across a restart', async () => {
    dataDir = tempDataDir('sqlite-restart')

    const first = await startServer({ dataDir })
    await seed(first)
    await first.stop()

    running = await startServer({ dataDir })
    const games = await running.get<unknown[]>('/api/v1/games')

    expect(games.body).toHaveLength(3)
  })
})

describe('a fresh Postgres install', () => {
  it('applies its migrations and round-trips data', async () => {
    database = 'tally_e2e_fresh_pg'
    dataDir = tempDataDir('pg-fresh')
    const connectionString = await createDatabase(database)

    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })

    const status = await running.get<{ state: string; dialect: string }>('/api/v1/system/db-status')
    expect(status.body).toMatchObject({ state: 'READY', dialect: 'postgres' })

    // Every migration, applied by the real runner against a real server.
    const applied = await queryDatabase<{ name: string }>(database, 'SELECT name FROM _migrations ORDER BY name')
    expect(applied.map((row) => row.name)).toEqual([
      '0001_initial.sql',
      '0002_settings_and_owner.sql',
      '0003_onboarding.sql',
      '0004_player_type.sql',
      '0005_bgg.sql',
      '0006_tally_meta.sql',
    ])

    await seed(running)

    const games = await running.get<unknown[]>('/api/v1/games')
    expect(games.body).toHaveLength(3)

    // No SQLite file is created when Postgres is configured — if one appeared,
    // some code path is still falling back and data would silently split.
    expect(existsSync(join(dataDir, 'tally.db'))).toBe(false)
  })

  // node-postgres returns COUNT as int8 and SUM as numeric, both as *strings*.
  // A regression here turns every number in the API into a string and the
  // frontend starts doing string arithmetic. Unit tests caught this once; this
  // asserts it end to end, through real HTTP and real JSON.
  it('returns aggregates as numbers, not strings', async () => {
    database = 'tally_e2e_aggregates'
    dataDir = tempDataDir('pg-aggregates')
    const connectionString = await createDatabase(database)

    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })
    await seed(running)

    const { body } = await running.get<Array<{ total_points: unknown; wins: unknown; total_sessions: unknown }>>('/api/v1/stats/leaderboard')

    expect(body.length).toBeGreaterThan(0)
    for (const row of body) {
      expect(typeof row.total_points).toBe('number')
      expect(typeof row.wins).toBe('number')
      expect(typeof row.total_sessions).toBe('number')
    }
  })

  // SQLite's LIKE is case-insensitive; Postgres's is not. Without searchLike()
  // this returns nothing and no error is raised anywhere.
  it('searches case-insensitively', async () => {
    database = 'tally_e2e_search'
    dataDir = tempDataDir('pg-search')
    const connectionString = await createDatabase(database)

    running = await startServer({ dataDir, env: { DATABASE_URL: connectionString } })
    await seed(running)

    const { body } = await running.get<unknown[]>('/api/v1/games?search=catan')

    expect(body).toHaveLength(1)
  })
})
