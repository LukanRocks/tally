import * as sqliteSchema from './schema.sqlite'
import * as pgSchema from './schema.pg'
import { dialect } from './index'

/**
 * Hands out the resolved dialect's tables under one set of names, so route code
 * imports from here and never learns which database it is talking to.
 *
 * The *values* are the running dialect's tables; the *types* are always the
 * SQLite ones. That pairs with the cast in index.ts — `db` is likewise typed as
 * the SQLite client — so the two lies are consistent and cancel out. Row shapes
 * are structurally identical across the dialects, which is what makes this safe.
 *
 * Column names must therefore stay identical between schema.sqlite.ts and
 * schema.pg.ts. Nothing here will tell you if they drift; only the dual-dialect
 * test matrix will.
 */
const resolved = dialect === 'postgres' ? pgSchema : sqliteSchema

export const games = resolved.games as typeof sqliteSchema.games
export const game_attachments = resolved.game_attachments as typeof sqliteSchema.game_attachments
export const players = resolved.players as typeof sqliteSchema.players
export const sessions = resolved.sessions as typeof sqliteSchema.sessions
export const session_results = resolved.session_results as typeof sqliteSchema.session_results
export const settings = resolved.settings as typeof sqliteSchema.settings
export const bgg_games = resolved.bgg_games as typeof sqliteSchema.bgg_games
export const _tally_meta = resolved._tally_meta as typeof sqliteSchema._tally_meta
