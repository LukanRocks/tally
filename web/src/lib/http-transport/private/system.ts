import { perform, request } from '../helpers'

export type DatabaseState = 'READY' | 'PENDING_IMPORT' | 'MISCONFIGURED'

export interface SourceCounts {
  games: number
  players: number
  sessions: number
}

/**
 * Two different servers answer `/system/db-status`, and only `state` is common
 * to both.
 *
 * The normal app returns `dialect`, `source` and `lastError`. When configuration
 * is invalid the normal app never boots, and a stripped-down server answers
 * instead with `problem` and `docsUrl` — it deliberately cannot touch the
 * database, so it has no counts to report.
 *
 * `state` is what tells them apart: MISCONFIGURED only ever comes from the
 * degraded server, PENDING_IMPORT only ever from the real one. Everything
 * outside that discriminator is optional here for exactly that reason.
 *
 * Note that `perform` strips nulls to undefined, so an absent `source` and an
 * explicit `source: null` arrive the same way.
 */
export interface DbStatus {
  state: DatabaseState
  dialect?: 'sqlite' | 'postgres'
  source?: SourceCounts
  lastError?: string
  problem?: string
  docsUrl?: string
}

export interface ImportResult {
  /** Rows copied, per table. Includes tables the user never sees, like bgg_games. */
  imported: Record<string, number>
  /** Where the original SQLite file was moved. The user's backup. */
  archivedTo: string
}

/** @internal Use via the database gate — do not import directly in components. */
export const systemTransport = {
  status: () => perform<DbStatus>('/system/db-status'),
  importFromSqlite: () => perform<ImportResult>('/system/import-from-sqlite', request('POST', {})),
}
