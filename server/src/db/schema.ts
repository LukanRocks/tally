import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  quick_rules: text('quick_rules'),
  min_players: integer('min_players'),
  max_players: integer('max_players'),
  purchase_at: text('purchase_at'),
  price: real('price'),
  cover_image_path: text('cover_image_path'),
  owner_id: integer('owner_id'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deleted_at: text('deleted_at'),
})

export const game_attachments = sqliteTable('game_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game_id: integer('game_id')
    .notNull()
    .references(() => games.id),
  label: text('label').notNull(),
  file_path: text('file_path').notNull(),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deleted_at: text('deleted_at'),
})

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  avatar_path: text('avatar_path'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deleted_at: text('deleted_at'),
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game_id: integer('game_id')
    .notNull()
    .references(() => games.id),
  played_at: text('played_at').notNull(),
  notes: text('notes'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deleted_at: text('deleted_at'),
})

export const session_results = sqliteTable('session_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  currency: text('currency').notNull().default('USD'),
  language: text('language').notNull().default('en'),
  default_owner_id: integer('default_owner_id'),
  theme: text('theme').notNull().default('system'),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})
