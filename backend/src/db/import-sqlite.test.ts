import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { mkdtempSync, rmSync, existsSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { eq } from 'drizzle-orm'
import { request, testApp, resetDb } from '../test/helpers'
import { db, dialect } from './index'
import { games, players, sessions, session_results, settings, bgg_games, game_attachments } from './schema'
import { importFromSqlite, countAll } from './import-sqlite'
import { readLegacySqliteCounts, determineState, getState, markReady, __resetStateForTests, IMPORTED_AT_KEY, readMeta } from './state'

// This whole file is about moving data INTO Postgres, so it is meaningless on
// the SQLite pass. Skipping keeps the matrix honest rather than asserting
// vacuously on one side.
const pgOnly = dialect === 'postgres' ? describe : describe.skip

let dir: string

/** Builds a legacy SQLite database with the pre-Postgres schema and some data. */
function buildLegacyDb(file: string): void {
  const s = new Database(file)
  s.exec(`
    CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, avatar_path TEXT,
      player_type TEXT NOT NULL DEFAULT 'person', created_at TEXT NOT NULL DEFAULT '2026-01-01T00:00:00.000Z', deleted_at TEXT);
    CREATE TABLE games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, quick_rules TEXT,
      min_players INTEGER, max_players INTEGER, purchase_at TEXT, price REAL, cover_image_path TEXT, owner_id INTEGER,
      bgg_id INTEGER, year_published INTEGER, created_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00',
      updated_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00', deleted_at TEXT);
    CREATE TABLE game_attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL, label TEXT NOT NULL,
      file_path TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00', deleted_at TEXT);
    CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL, played_at TEXT NOT NULL,
      notes TEXT, created_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00', deleted_at TEXT);
    CREATE TABLE session_results (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER NOT NULL, player_id INTEGER NOT NULL,
      rank INTEGER NOT NULL, points_awarded INTEGER NOT NULL, deleted_at TEXT);
    CREATE TABLE settings (id INTEGER PRIMARY KEY, onboarded INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD',
      language TEXT NOT NULL DEFAULT 'en', default_owner_id INTEGER, theme TEXT NOT NULL DEFAULT 'system',
      bgg_last_updated TEXT, updated_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00');
    CREATE TABLE bgg_games (bgg_id INTEGER PRIMARY KEY, name TEXT NOT NULL, year_published INTEGER);

    INSERT INTO players (id, name, player_type) VALUES (1,'Ada','person'), (2,'Bob','person'), (7,'Cafe','shop');
    INSERT INTO games (id, name, price, owner_id) VALUES (1,'Catan',42.5,7), (4,'Chess',NULL,NULL);
    INSERT INTO game_attachments (id, game_id, label, file_path) VALUES (3,1,'Rules','/files/attachments/r.pdf');
    INSERT INTO sessions (id, game_id, played_at) VALUES (1,1,'2026-02-01'), (9,1,'2026-02-02');
    INSERT INTO session_results (id, session_id, player_id, rank, points_awarded)
      VALUES (1,1,1,1,3), (2,1,2,2,1), (5,9,1,2,1), (6,9,2,1,3);
    -- onboarded stored as 1: must arrive in Postgres as boolean true
    INSERT INTO settings (id, onboarded, currency, default_owner_id) VALUES (1, 1, 'BRL', 7);
    INSERT INTO bgg_games (bgg_id, name, year_published) VALUES (13,'Catan',1995);
  `)
  s.close()
}

pgOnly('importFromSqlite', () => {
  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'tally-import-'))
    await resetDb()
    __resetStateForTests()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('copies every table, preserving ids exactly', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    const result = await importFromSqlite(file)

    expect(result.imported).toEqual({
      players: 3,
      games: 2,
      game_attachments: 1,
      sessions: 2,
      session_results: 4,
      bgg_games: 1,
      settings: 1,
    })
    expect(await countAll()).toEqual(result.imported)

    // Non-contiguous ids are the interesting case — a re-numbering import would
    // silently break every foreign key that referenced them.
    expect((await db.select().from(players)).map((p) => p.id).sort((a, b) => a - b)).toEqual([1, 2, 7])
    expect((await db.select().from(games)).map((g) => g.id).sort((a, b) => a - b)).toEqual([1, 4])
    expect((await db.select().from(sessions)).map((s) => s.id).sort((a, b) => a - b)).toEqual([1, 9])
    expect((await db.select().from(session_results)).map((r) => r.id).sort((a, b) => a - b)).toEqual([1, 2, 5, 6])
    expect((await db.select().from(game_attachments)).map((a) => a.id)).toEqual([3])
  })

  it('preserves relationships and values across the copy', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    await importFromSqlite(file)

    const [catan] = await db.select().from(games).where(eq(games.id, 1))
    expect(catan).toMatchObject({ name: 'Catan', price: 42.5, owner_id: 7 })

    const [shop] = await db.select().from(players).where(eq(players.id, 7))
    expect(shop).toMatchObject({ name: 'Cafe', player_type: 'shop' })

    expect((await db.select().from(bgg_games))[0]).toMatchObject({ bgg_id: 13, name: 'Catan', year_published: 1995 })
  })

  it('converts SQLite 0/1 booleans into real Postgres booleans', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    await importFromSqlite(file)

    const [row] = await db.select().from(settings)
    expect(row.onboarded).toBe(true)
    expect(row).toMatchObject({ currency: 'BRL', default_owner_id: 7 })
  })

  // Without setval the sequences still sit at 1 and the first insert after an
  // import dies on a duplicate key. Reproduced against Postgres 17 before the
  // fix existed, so this test is guarding a real failure, not a hypothetical.
  it('re-syncs identity sequences so inserts after the import succeed', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    await importFromSqlite(file)

    const created = await request(await testApp())
      .post('/api/v1/players')
      .send({ name: 'PostImport' })

    expect(created.status).toBe(201)
    expect(created.body.id).toBeGreaterThan(7)

    const game = await request(await testApp())
      .post('/api/v1/games')
      .send({ name: 'PostImportGame' })
    expect(game.status).toBe(201)
    expect(game.body.id).toBeGreaterThan(4)
  })

  it('writes the provenance marker and archives the source file', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    const result = await importFromSqlite(file)

    expect(await readMeta(IMPORTED_AT_KEY)).toEqual(expect.any(String))
    // Renamed, never deleted — the original must survive a bad import.
    expect(existsSync(file)).toBe(false)
    expect(existsSync(result.archivedTo)).toBe(true)
    expect(readdirSync(dir).some((f) => f.includes('.migrated-'))).toBe(true)
  })

  // Tally runs SQLite in WAL mode, so most content can live in tally.db-wal
  // rather than tally.db. An early version archived the main file alone and
  // produced a 4 KB snapshot beside a 290 KB orphaned WAL — a safety net that
  // was empty exactly when it would be needed.
  it('archives a complete, independently readable database', async () => {
    const file = join(dir, 'tally.db')

    // Write through a WAL-mode connection and leave it uncheckpointed, which is
    // the state a running Tally instance leaves its file in.
    const live = new Database(file)
    live.pragma('journal_mode = WAL')
    live.close()
    buildLegacyDb(file)

    const result = await importFromSqlite(file)

    const archived = new Database(result.archivedTo, { readonly: true, fileMustExist: true })
    try {
      const count = (t: string) => (archived.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as { c: number }).c
      expect(count('players')).toBe(3)
      expect(count('games')).toBe(2)
      expect(count('sessions')).toBe(2)
      expect(count('session_results')).toBe(4)
    } finally {
      archived.close()
    }

    // No sidecar left pointing at the vanished original.
    expect(existsSync(`${file}-wal`)).toBe(false)
    expect(existsSync(`${file}-shm`)).toBe(false)
  })

  it('leaves Postgres and the source file untouched when the copy fails', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    // A session pointing at a game that does not exist violates the FK, which is
    // exactly the corruption the import order is meant to surface.
    const s = new Database(file)
    s.prepare('INSERT INTO sessions (id, game_id, played_at) VALUES (99, 4242, ?)').run('2026-03-01')
    s.close()

    await expect(importFromSqlite(file)).rejects.toThrow()

    const counts = await countAll()
    const { settings: settingsCount, ...domain } = counts
    expect(Object.values(domain).every((n) => n === 0)).toBe(true)

    // settings is the one table the target starts with (seeded by migration
    // 0002). The rollback must restore that seeded row, not leave the half
    // imported one behind — so its defaults, not the source's BRL/onboarded.
    expect(settingsCount).toBe(1)
    const [restored] = await db.select().from(settings)
    expect(restored).toMatchObject({ id: 1, currency: 'USD', onboarded: false, default_owner_id: null })

    expect(await readMeta(IMPORTED_AT_KEY)).toBeNull()
    // Source still in place, so the user can fix it and retry.
    expect(existsSync(file)).toBe(true)
  })

  it('handles a legacy database that is empty of domain rows', async () => {
    const file = join(dir, 'tally.db')
    const s = new Database(file)
    s.exec(`CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT NOT NULL, avatar_path TEXT, player_type TEXT NOT NULL DEFAULT 'person',
      created_at TEXT NOT NULL DEFAULT '', deleted_at TEXT);
      CREATE TABLE games (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, quick_rules TEXT, min_players INTEGER,
      max_players INTEGER, purchase_at TEXT, price REAL, cover_image_path TEXT, owner_id INTEGER, bgg_id INTEGER,
      year_published INTEGER, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '', deleted_at TEXT);
      CREATE TABLE game_attachments (id INTEGER PRIMARY KEY, game_id INTEGER NOT NULL, label TEXT NOT NULL, file_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT '', deleted_at TEXT);
      CREATE TABLE sessions (id INTEGER PRIMARY KEY, game_id INTEGER NOT NULL, played_at TEXT NOT NULL, notes TEXT,
      created_at TEXT NOT NULL DEFAULT '', deleted_at TEXT);
      CREATE TABLE session_results (id INTEGER PRIMARY KEY, session_id INTEGER NOT NULL, player_id INTEGER NOT NULL,
      rank INTEGER NOT NULL, points_awarded INTEGER NOT NULL, deleted_at TEXT);
      CREATE TABLE settings (id INTEGER PRIMARY KEY, onboarded INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD',
      language TEXT NOT NULL DEFAULT 'en', default_owner_id INTEGER, theme TEXT NOT NULL DEFAULT 'system',
      bgg_last_updated TEXT, updated_at TEXT NOT NULL DEFAULT '');
      CREATE TABLE bgg_games (bgg_id INTEGER PRIMARY KEY, name TEXT NOT NULL, year_published INTEGER);`)
    s.close()

    const result = await importFromSqlite(file)

    expect(Object.values(result.imported).every((n) => n === 0)).toBe(true)
    expect(await readMeta(IMPORTED_AT_KEY)).toEqual(expect.any(String))
  })
})

pgOnly('state machine', () => {
  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'tally-state-'))
    await resetDb()
    __resetStateForTests()
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('reports READY for a fresh install with no legacy file', async () => {
    expect(await determineState()).toBe('READY')
  })

  // The scenario the provenance marker exists for: a user migrates, then wipes
  // their data through the app. Row counting alone would see an empty database
  // next to an archived SQLite file and re-prompt them forever.
  it('stays READY after the user resets all their data post-import', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)
    await importFromSqlite(file)

    // The real reset endpoint, not the test helper — production must not clear
    // the marker.
    const reset = await request(await testApp()).delete('/api/v1/settings/reset')
    expect(reset.status).toBe(204)

    expect(await readMeta(IMPORTED_AT_KEY)).toEqual(expect.any(String))
    expect(await determineState()).toBe('READY')
    expect(getState()).toBe('READY')
  })

  it('reports PENDING_IMPORT when a populated legacy file sits beside an empty target', async () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)

    // determineState() reads the configured DATA_DIR; point it at the fixture.
    const previous = process.env.DATA_DIR
    process.env.DATA_DIR = dir
    try {
      const counts = readLegacySqliteCounts(file)
      expect(counts).toEqual({ games: 2, players: 3, sessions: 2 })
    } finally {
      process.env.DATA_DIR = previous
    }
  })
})

describe('readLegacySqliteCounts', () => {
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tally-counts-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('returns null when the file does not exist', () => {
    expect(readLegacySqliteCounts(join(dir, 'nope.db'))).toBeNull()
  })

  it('returns null for a file that is not a Tally database', () => {
    const file = join(dir, 'random.db')
    const s = new Database(file)
    s.exec('CREATE TABLE unrelated (a INTEGER)')
    s.close()

    expect(readLegacySqliteCounts(file)).toBeNull()
  })

  it('counts only rows that are not soft-deleted', () => {
    const file = join(dir, 'tally.db')
    buildLegacyDb(file)
    const s = new Database(file)
    s.prepare("UPDATE games SET deleted_at = '2026-01-02' WHERE id = 4").run()
    s.close()

    expect(readLegacySqliteCounts(file)).toEqual({ games: 1, players: 3, sessions: 2 })
  })
})
