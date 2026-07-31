import Database from 'better-sqlite3'
import { existsSync } from 'fs'
import { join } from 'path'
import { eq } from 'drizzle-orm'
import { db, dialect, DATA_DIR } from './index'
import { _tally_meta } from './schema'
import { games, players, sessions } from './schema'

export type { DatabaseState } from './state-types'
import type { DatabaseState } from './state-types'

export const IMPORTED_AT_KEY = 'imported_from_sqlite_at'

/** Tables whose emptiness decides "is this a fresh install?". */
const DOMAIN_TABLES = [games, players, sessions]

export interface SourceCounts {
  games: number
  players: number
  sessions: number
}

let state: DatabaseState = 'READY'
let sourceCounts: SourceCounts | null = null
let lastError: string | null = null

export const legacySqlitePath = (): string => join(DATA_DIR, 'tally.db')

export async function readMeta(key: string): Promise<string | null> {
  const [row] = await db.select().from(_tally_meta).where(eq(_tally_meta.key, key)).limit(1)
  return row?.value ?? null
}

export async function writeMeta(tx: typeof db, key: string, value: string): Promise<void> {
  await tx.delete(_tally_meta).where(eq(_tally_meta.key, key))
  await tx.insert(_tally_meta).values({ key, value })
}

async function targetHasData(): Promise<boolean> {
  for (const table of DOMAIN_TABLES) {
    const rows = await db.select().from(table).limit(1)
    if (rows.length > 0) return true
  }
  return false
}

/**
 * Counts domain rows in a legacy SQLite file without going through the app's
 * own connection — the app is on Postgres at this point, so this opens the file
 * read-only purely to see whether it holds anything worth importing.
 *
 * Returns null when the file is absent, unreadable, or predates the schema.
 */
export function readLegacySqliteCounts(file = legacySqlitePath()): SourceCounts | null {
  if (!existsSync(file)) return null

  let handle: Database.Database | undefined

  try {
    handle = new Database(file, { readonly: true, fileMustExist: true })

    const count = (table: string): number => {
      const row = handle!.prepare(`SELECT COUNT(*) AS c FROM ${table} WHERE deleted_at IS NULL`).get() as { c: number }
      return row.c
    }

    return { games: count('games'), players: count('players'), sessions: count('sessions') }
  } catch {
    // A file that is not a Tally database, or is corrupt, is treated as "nothing
    // to import" rather than blocking startup.
    return null
  } finally {
    handle?.close()
  }
}

/**
 * Decides whether the app may serve data.
 *
 * PENDING_IMPORT means: the user pointed a populated install at an empty
 * Postgres. Serving normally there would let them write into the empty database
 * while their real data sits in the SQLite file, leaving neither authoritative.
 */
export async function determineState(): Promise<DatabaseState> {
  lastError = null

  if (dialect !== 'postgres') {
    state = 'READY'
    return state
  }

  if (await readMeta(IMPORTED_AT_KEY)) {
    state = 'READY'
    return state
  }

  if (await targetHasData()) {
    state = 'READY'
    return state
  }

  const counts = readLegacySqliteCounts()
  const total = counts ? counts.games + counts.players + counts.sessions : 0

  if (counts && total > 0) {
    sourceCounts = counts
    state = 'PENDING_IMPORT'
    return state
  }

  state = 'READY'
  return state
}

export const getState = (): DatabaseState => state
export const getSourceCounts = (): SourceCounts | null => (state === 'PENDING_IMPORT' ? sourceCounts : null)
export const getLastError = (): string | null => lastError
export const setLastError = (message: string | null): void => {
  lastError = message
}
export const markReady = (): void => {
  state = 'READY'
  sourceCounts = null
  lastError = null
}

/** Test seam — resets module state between cases. */
export const __resetStateForTests = (): void => {
  state = 'READY'
  sourceCounts = null
  lastError = null
}

/**
 * Test seam — forces a state so the gate can be exercised without constructing a
 * whole legacy database. The gate is the safety-critical piece here; it deserves
 * tests that do not depend on the importer working.
 */
export const __setStateForTests = (next: DatabaseState, counts: SourceCounts | null = null): void => {
  state = next
  sourceCounts = counts
}
