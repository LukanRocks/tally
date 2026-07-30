import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../app'
import { runMigrations, sqlite } from '../db'

// Every table, child-before-parent, matching the FK order the reset endpoint uses.
const TABLES = ['settings', 'bgg_games', 'session_results', 'sessions', 'game_attachments', 'games', 'players'] as const

let app: Express | undefined

/**
 * Migrates the (empty, per-file) database and returns a mounted app.
 * Safe to call from every test file; migrations are idempotent.
 */
export function testApp(): Express {
  if (!app) {
    runMigrations()
    app = createApp()
  }
  return app
}

/**
 * Truncates every table and restores the settings singleton, so each test starts
 * from the same state a fresh install would have.
 *
 * Uses the raw driver deliberately: sqlite_sequence has no portable equivalent,
 * and resetting it is what makes row IDs predictable across tests. Phase 3 will
 * need a dialect-aware version of this helper.
 */
export function resetDb(): void {
  // Callers use this in beforeEach, which runs before the test body touches
  // testApp() — so ensure the schema exists before truncating it.
  testApp()

  sqlite.pragma('foreign_keys = OFF')
  for (const table of TABLES) {
    sqlite.prepare(`DELETE FROM ${table}`).run()
  }
  sqlite.prepare('DELETE FROM sqlite_sequence').run()
  sqlite.prepare('INSERT INTO settings (id) VALUES (1)').run()
  sqlite.pragma('foreign_keys = ON')
}

// ── fixtures ──
// These go through the API rather than inserting directly, so setup exercises the
// same validation and defaulting the routes apply in production.

export async function createPlayer(name: string, player_type: 'person' | 'shop' = 'person') {
  const res = await request(testApp()).post('/api/v1/players').send({ name, player_type })
  if (res.status !== 201) throw new Error(`createPlayer(${name}) failed: ${res.status} ${res.text}`)
  return res.body as { id: number; name: string; player_type: 'person' | 'shop' }
}

export async function createGame(name: string, extra: Record<string, unknown> = {}) {
  const res = await request(testApp())
    .post('/api/v1/games')
    .send({ name, ...extra })
  if (res.status !== 201) throw new Error(`createGame(${name}) failed: ${res.status} ${res.text}`)
  return res.body as { id: number; name: string }
}

export async function createSession(game_id: number, results: { player_id: number; rank: number }[], played_at = '2026-01-15T20:00:00.000Z', notes?: string) {
  const res = await request(testApp()).post('/api/v1/sessions').send({ game_id, played_at, notes, results })
  if (res.status !== 201) throw new Error(`createSession failed: ${res.status} ${res.text}`)
  return res.body as { id: number; game_id: number }
}

export { request }
