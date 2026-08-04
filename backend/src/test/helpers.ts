import request from 'supertest'
import type { Express } from 'express'
import { sql, type SQL } from 'drizzle-orm'
import { createApp } from '../app'
import { runMigrations, db, dialect } from '../db'
import { games, game_attachments, players, sessions, session_results, settings, bgg_games, _tally_meta } from '../db/schema'

// Child-before-parent, matching the FK order the reset endpoint uses.
// _tally_meta is included so the import provenance marker cannot leak between
// tests. Production reset deliberately does NOT clear it — doing so would make
// a migrated install prompt for import all over again.
const TABLES = [settings, bgg_games, session_results, sessions, game_attachments, games, players, _tally_meta]

let app: Express | undefined

/**
 * Migrates the (empty, per-file) database and returns a mounted app.
 * Safe to call from every test file; migrations are idempotent.
 */
export async function testApp(): Promise<Express> {
  if (!app) {
    await runMigrations()
    app = createApp()
  }
  return app
}

/**
 * Truncates every table and restores the settings singleton, so each test starts
 * from the same state a fresh install would have.
 *
 * Identity/autoincrement counters are reset too — that is what makes row IDs
 * predictable across tests, and it is the one part that cannot be expressed
 * portably, hence the dialect branch.
 */
export async function resetDb(): Promise<void> {
  // Callers use this in beforeEach, which runs before the test body touches
  // testApp() — so ensure the schema exists before truncating it.
  await testApp()

  if (dialect === 'postgres') {
    const names = ['settings', 'bgg_games', 'session_results', 'sessions', 'game_attachments', 'games', 'players', '_tally_meta']
    // TRUNCATE ... RESTART IDENTITY resets the sequences in the same statement.
    //
    // `db` is typed as the SQLite client (see the cast in db/index.ts) but is a
    // node-postgres client on this branch — the same seam db/import-sqlite.ts
    // crosses, handled the same way. `.execute()` is the Postgres raw-SQL entry
    // point.
    const pgDb = db as unknown as { execute: (query: SQL) => Promise<unknown> }
    await pgDb.execute(sql.raw(`TRUNCATE TABLE ${names.join(', ')} RESTART IDENTITY CASCADE`))
  } else {
    for (const table of TABLES) {
      await db.delete(table)
    }
    await db.run(sql`DELETE FROM sqlite_sequence`)
  }

  await db.insert(settings).values({ id: 1 })
}

// ── fixtures ──
// These go through the API rather than inserting directly, so setup exercises the
// same validation and defaulting the routes apply in production.

export async function createPlayer(name: string, player_type: 'person' | 'shop' = 'person') {
  const res = await request(await testApp())
    .post('/api/v1/players')
    .send({ name, player_type })
  if (res.status !== 201) throw new Error(`createPlayer(${name}) failed: ${res.status} ${res.text}`)
  return res.body as { id: number; name: string; player_type: 'person' | 'shop' }
}

export async function createGame(name: string, extra: Record<string, unknown> = {}) {
  const res = await request(await testApp())
    .post('/api/v1/games')
    .send({ name, ...extra })
  if (res.status !== 201) throw new Error(`createGame(${name}) failed: ${res.status} ${res.text}`)
  return res.body as { id: number; name: string }
}

export async function createSession(game_id: number, results: { player_id: number; rank: number }[], played_at = '2026-01-15T20:00:00.000Z', notes?: string) {
  const res = await request(await testApp())
    .post('/api/v1/sessions')
    .send({ game_id, played_at, notes, results })
  if (res.status !== 201) throw new Error(`createSession failed: ${res.status} ${res.text}`)
  return res.body as { id: number; game_id: number }
}

export { request, dialect }
