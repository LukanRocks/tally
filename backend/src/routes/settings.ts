import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and } from 'drizzle-orm'
import { readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { db, DATA_DIR } from '../db'
import { withTransaction } from '../db/transaction'
import {
  settings as settingsTable,
  players as playersTable,
  bgg_games as bggTable,
  session_results as resultsTable,
  sessions as sessionsTable,
  game_attachments as attachmentsTable,
  games as gamesTable,
} from '../db/schema'

// #DOCS: Migration 0002_settings_and_owner.sql seeds DB by default creating a singleton
const SETTINGS_SINGLETON = 1
const stripId = <T extends { id: number }>({ id: _id, ...rest }: T) => rest
const router = Router()

// GET /api/v1/settings
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.id, SETTINGS_SINGLETON)).limit(1)

    res.json(stripId(row))
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/settings
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
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
      if (typeof onboarded !== 'boolean') return res.status(400).json({ error: 'Invalid onboarded value' })
      patch.onboarded = onboarded
    }
    if (default_owner_id !== undefined) {
      if (default_owner_id !== null) {
        const [player] = await db
          .select()
          .from(playersTable)
          .where(and(eq(playersTable.id, Number(default_owner_id)), isNull(playersTable.deleted_at)))
          .limit(1)
        if (!player) return res.status(404).json({ error: 'Player not found' })
      }
      patch.default_owner_id = default_owner_id ?? null
    }

    const [updated] = await db.update(settingsTable).set(patch).where(eq(settingsTable.id, SETTINGS_SINGLETON)).returning()

    res.json(stripId(updated))
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/settings/reset
router.delete('/reset', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await withTransaction(async (tx) => {
      // 1. Clear settings FK before players are removed
      await tx.delete(settingsTable)
      await tx.delete(bggTable)
      // 2-5. Clear dependent tables before their parents
      await tx.delete(resultsTable)
      await tx.delete(sessionsTable)
      await tx.delete(attachmentsTable)
      await tx.delete(gamesTable)
      // 6. Players
      await tx.delete(playersTable)
      // 7. Re-seed settings with defaults
      await tx.insert(settingsTable).values({ id: SETTINGS_SINGLETON })
    })

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
