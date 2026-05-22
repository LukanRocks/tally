import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and } from 'drizzle-orm'
import { readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { db, sqlite, DATA_DIR } from '../db'
import { settings as settingsTable, players as playersTable } from '../db/schema'

// #DOCS: Migration 0002_settings_and_owner.sql seeds DB by default creating a singleton
const SETTINGS_SINGLETON = 1
const stripId = <T extends { id: number }>({ id: _id, ...rest }: T) => rest
const router = Router()

// GET /api/v1/settings
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const row = db.select().from(settingsTable).where(eq(settingsTable.id, SETTINGS_SINGLETON)).get()!

    res.json(stripId(row))
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/settings
router.put('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currency, language, default_owner_id, theme, onboarded } = req.body
    const patch: Record<string, any> = { updated_at: new Date().toISOString() }

    if (currency !== undefined) {
      if (!['USD', 'BRL'].includes(currency)) return res.status(400).json({ error: 'Invalid currency' })
      patch.currency = currency
    }
    if (language !== undefined) {
      if (!['en', 'pt'].includes(language)) return res.status(400).json({ error: 'Invalid language' })
      patch.language = language
    }
    if (theme !== undefined) {
      if (!['light', 'dark', 'system'].includes(theme)) return res.status(400).json({ error: 'Invalid theme' })
      patch.theme = theme
    }
    if (onboarded !== undefined) {
      if (onboarded !== 0 && onboarded !== 1) return res.status(400).json({ error: 'Invalid onboarded value' })
      patch.onboarded = onboarded
    }
    if (default_owner_id !== undefined) {
      if (default_owner_id !== null) {
        const player = db
          .select()
          .from(playersTable)
          .where(and(eq(playersTable.id, Number(default_owner_id)), isNull(playersTable.deleted_at)))
          .get()
        if (!player) return res.status(404).json({ error: 'Player not found' })
      }
      patch.default_owner_id = default_owner_id || null
    }

    const [updated] = db.update(settingsTable).set(patch).where(eq(settingsTable.id, SETTINGS_SINGLETON)).returning().all()

    res.json(stripId(updated))
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/settings/reset
router.delete('/reset', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reset = sqlite.transaction(() => {
      // 1. Clear settings FK before players are removed
      sqlite.prepare('DELETE FROM settings').run()
      sqlite.prepare('DELETE FROM bgg_games').run()
      // 2-5. Clear dependent tables before their parents
      sqlite.prepare('DELETE FROM session_results').run()
      sqlite.prepare('DELETE FROM sessions').run()
      sqlite.prepare('DELETE FROM game_attachments').run()
      sqlite.prepare('DELETE FROM games').run()
      // 6. Players
      sqlite.prepare('DELETE FROM players').run()
      // 7. Re-seed settings with defaults
      sqlite.prepare('INSERT INTO settings (id) VALUES (?)').run(SETTINGS_SINGLETON)
    })

    reset()

    // Wipe uploaded files
    for (const subdir of ['covers', 'attachments', 'avatars']) {
      const dir = join(DATA_DIR, subdir)
      try {
        for (const file of readdirSync(dir)) {
          unlinkSync(join(dir, file))
        }
      } catch {
        // Directory may not exist yet — safe to ignore
      }
    }

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
