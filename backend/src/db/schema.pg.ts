import { pgTable, integer, text, doublePrecision, boolean } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * Postgres twin of schema.sqlite.ts.
 *
 * Column names must match the SQLite schema exactly — the §4.3 cast in index.ts
 * means the compiler will NOT catch a mismatch here. The dual-dialect test
 * matrix is the only thing checking this seam.
 *
 * Timestamps stay `text`, not `timestamptz`. Switching would ripple into the API
 * contract and the frontend types for no gain. The two default expressions below
 * reproduce SQLite's output byte for byte — verified against Postgres 17:
 *   datetime('now')                        -> 2026-07-30 20:16:04
 *   strftime('%Y-%m-%dT%H:%M:%fZ','now')   -> 2026-07-30T20:16:04.726Z
 * Note the schema genuinely uses both formats; players differs from the rest.
 */
const NOW_DATETIME = sql`to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')`
const NOW_ISO = sql`to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`

export const games = pgTable('games', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  quick_rules: text('quick_rules'),
  min_players: integer('min_players'),
  max_players: integer('max_players'),
  purchase_at: text('purchase_at'),
  price: doublePrecision('price'),
  cover_image_path: text('cover_image_path'),
  owner_id: integer('owner_id'),
  bgg_id: integer('bgg_id'),
  year_published: integer('year_published'),
  created_at: text('created_at').notNull().default(NOW_DATETIME),
  updated_at: text('updated_at').notNull().default(NOW_DATETIME),
  deleted_at: text('deleted_at'),
})

export const game_attachments = pgTable('game_attachments', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  game_id: integer('game_id')
    .notNull()
    .references(() => games.id),
  label: text('label').notNull(),
  file_path: text('file_path').notNull(),
  created_at: text('created_at').notNull().default(NOW_DATETIME),
  deleted_at: text('deleted_at'),
})

export const players = pgTable('players', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  avatar_path: text('avatar_path'),
  player_type: text('player_type', { enum: ['person', 'shop'] })
    .notNull()
    .default('person'),
  created_at: text('created_at').notNull().default(NOW_ISO),
  deleted_at: text('deleted_at'),
})

export const sessions = pgTable('sessions', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  game_id: integer('game_id')
    .notNull()
    .references(() => games.id),
  played_at: text('played_at').notNull(),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(NOW_DATETIME),
  deleted_at: text('deleted_at'),
})

export const session_results = pgTable('session_results', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  session_id: integer('session_id')
    .notNull()
    .references(() => sessions.id),
  player_id: integer('player_id')
    .notNull()
    .references(() => players.id),
  rank: integer('rank').notNull(),
  points_awarded: integer('points_awarded').notNull(),
  deleted_at: text('deleted_at'),
})

// Singleton row with an explicit id, so no identity sequence here.
export const settings = pgTable('settings', {
  id: integer('id').primaryKey(),
  onboarded: boolean('onboarded').notNull().default(false),
  currency: text('currency').notNull().default('USD'),
  language: text('language').notNull().default('en'),
  default_owner_id: integer('default_owner_id'),
  theme: text('theme').notNull().default('system'),
  bgg_last_updated: text('bgg_last_updated'),
  updated_at: text('updated_at').notNull().default(NOW_DATETIME),
})

export const bgg_games = pgTable('bgg_games', {
  bgg_id: integer('bgg_id').primaryKey(),
  name: text('name').notNull(),
  year_published: integer('year_published'),
})
