import Database from 'better-sqlite3'
import { renameSync, existsSync } from 'fs'
import { sql, type SQL } from 'drizzle-orm'
import { db, dialect } from './index'
import { withTransaction } from './transaction'
import { games, game_attachments, players, sessions, session_results, settings, bgg_games } from './schema'
import { IMPORTED_AT_KEY, legacySqlitePath, writeMeta, markReady } from './state'

export interface ImportResult {
  imported: Record<string, number>
  archivedTo: string
}

/**
 * Parent-before-child. Reversing this violates the foreign keys immediately,
 * which is the intended safety net rather than something to work around.
 */
const IMPORT_ORDER = [
  { name: 'players', table: players },
  { name: 'games', table: games },
  { name: 'game_attachments', table: game_attachments },
  { name: 'sessions', table: sessions },
  { name: 'session_results', table: session_results },
  { name: 'bgg_games', table: bgg_games },
  { name: 'settings', table: settings },
] as const

/** Tables whose ids come from an identity sequence that must be re-synced. */
const SEQUENCE_TABLES = ['players', 'games', 'game_attachments', 'sessions', 'session_results'] as const

// Bounded so a large collection cannot exceed Postgres' 65535 parameter ceiling.
const INSERT_CHUNK = 250

/** SQLite stores booleans as 0/1; Postgres wants real booleans. */
function coerceRow(tableName: string, row: Record<string, unknown>): Record<string, unknown> {
  if (tableName === 'settings' && 'onboarded' in row) {
    return { ...row, onboarded: Boolean(row.onboarded) }
  }
  return row
}

/**
 * Copies a legacy SQLite database into the configured Postgres database,
 * preserving every id, then archives the source file.
 *
 * All-or-nothing: the whole copy runs in one transaction, and the provenance
 * marker is written inside it. A failure leaves Postgres untouched and the
 * SQLite file exactly where it was, so the user can retry or revert.
 */
export async function importFromSqlite(file = legacySqlitePath()): Promise<ImportResult> {
  if (dialect !== 'postgres') {
    throw new Error('Import is only meaningful when the target is Postgres.')
  }

  checkpointWal(file)

  const source = new Database(file, { readonly: true, fileMustExist: true })
  const imported: Record<string, number> = {}

  try {
    await withTransaction(async (tx) => {
      for (const { name, table } of IMPORT_ORDER) {
        const rows = source.prepare(`SELECT * FROM ${name}`).all() as Record<string, unknown>[]
        imported[name] = rows.length

        // Migration 0002 seeds the settings singleton, so a target created by our
        // own migrations always has id=1 already. The user's settings replace
        // those defaults rather than colliding with them. Every other table is
        // guaranteed empty here — the state machine only offers an import when
        // the target has no domain rows.
        if (name === 'settings' && rows.length > 0) {
          await tx.delete(table)
        }

        for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
          const chunk = rows.slice(i, i + INSERT_CHUNK).map((row) => coerceRow(name, row))
          await tx.insert(table).values(chunk as never)
        }
      }

      // Rows carry explicit ids, so the identity sequences are still at 1. Without
      // this the very first insert after an import dies on a duplicate key —
      // reproduced against Postgres 17 before writing this.
      //
      // `tx` is typed as the SQLite client (see the cast in index.ts) but is a
      // node-postgres client here — this function refuses to run on any other
      // dialect. `.execute()` is the Postgres raw-SQL entry point.
      const pgTx = tx as unknown as { execute: (query: SQL) => Promise<unknown> }

      for (const name of SEQUENCE_TABLES) {
        await pgTx.execute(sql.raw(`SELECT setval(pg_get_serial_sequence('${name}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${name}), 1))`))
      }

      await writeMeta(tx, IMPORTED_AT_KEY, new Date().toISOString())
    })
  } finally {
    source.close()
  }

  // Only once the transaction has committed. Renamed, never deleted — if
  // anything about the import turns out to be wrong, the original is right there.
  const archivedTo = `${file}.migrated-${new Date().toISOString().replace(/[:.]/g, '-')}`
  renameSync(file, archivedTo)

  // SQLite names its sidecars after the database file, so leaving them behind
  // would orphan them from the archive. The checkpoint above should have
  // emptied the WAL, but move whatever remains so the archive stays complete
  // and self-contained.
  for (const suffix of WAL_SIDECARS) {
    if (existsSync(`${file}${suffix}`)) renameSync(`${file}${suffix}`, `${archivedTo}${suffix}`)
  }

  markReady()

  return { imported, archivedTo }
}

const WAL_SIDECARS = ['-wal', '-shm'] as const

/**
 * Folds the write-ahead log into the main database file.
 *
 * Tally runs SQLite in WAL mode, so a live database can hold most of its content
 * in tally.db-wal rather than tally.db. Archiving the main file alone would
 * produce a near-empty snapshot — measured at 4 KB against a 290 KB WAL — which
 * is worthless precisely when the user needs it, on a revert.
 *
 * Best effort: a non-WAL or unwritable file simply has nothing to fold in, and
 * that must not block a migration.
 */
function checkpointWal(file: string): void {
  let handle: Database.Database | undefined

  try {
    handle = new Database(file, { fileMustExist: true })
    handle.pragma('wal_checkpoint(TRUNCATE)')
  } catch {
    // Ignored deliberately — see above.
  } finally {
    handle?.close()
  }
}

/** Row counts in the live database, for verifying an import. */
export async function countAll(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}

  for (const { name, table } of IMPORT_ORDER) {
    counts[name] = (await db.select().from(table)).length
  }

  return counts
}
