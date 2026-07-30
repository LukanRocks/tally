import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and, sql } from 'drizzle-orm'
import path from 'path'
import { existsSync, unlinkSync } from 'fs'
import { db, DATA_DIR } from '../db'
import { players as playersTable, session_results as resultsTable, settings as settingsTable } from '../db/schema'
import { avatarUpload } from '../middleware/upload'

const router = Router()

// GET /api/v1/players
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        avatar_path: playersTable.avatar_path,
        player_type: playersTable.player_type,
        created_at: playersTable.created_at,
        total_points: sql<number>`(
        SELECT COALESCE(SUM(sr.points_awarded), 0)
        FROM session_results sr
        JOIN sessions s ON s.id = sr.session_id
        WHERE sr.player_id = players.id
          AND sr.deleted_at IS NULL
          AND s.deleted_at IS NULL
      )`,
        total_sessions: sql<number>`(
        SELECT COUNT(*)
        FROM session_results sr
        JOIN sessions s ON s.id = sr.session_id
        WHERE sr.player_id = players.id
          AND sr.deleted_at IS NULL
          AND s.deleted_at IS NULL
      )`,
      })
      .from(playersTable)
      .where(isNull(playersTable.deleted_at))

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/players/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const [player] = await db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .limit(1)

    if (!player) return res.status(404).json({ error: 'Player not found' })

    const [stats] = await db
      .select({
        total_points: sql<number>`COALESCE(SUM(points_awarded), 0)`,
        total_sessions: sql<number>`COUNT(DISTINCT session_id)`,
        wins: sql<number>`SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END)`,
      })
      .from(resultsTable)
      .where(and(eq(resultsTable.player_id, id), isNull(resultsTable.deleted_at)))
      .limit(1)

    const win_rate = stats && stats.total_sessions > 0 ? Math.round((stats.wins / stats.total_sessions) * 100) : 0

    res.json({ ...player, ...(stats ?? {}), win_rate })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/players
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, player_type } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
    if (player_type && !['person', 'shop'].includes(player_type)) {
      return res.status(400).json({ error: 'player_type must be "person" or "shop"' })
    }

    const [player] = await db
      .insert(playersTable)
      .values({ name: name.trim(), player_type: player_type ?? 'person' })
      .returning()
    res.status(201).json(player)
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/players/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const [existing] = await db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Player not found' })

    const { name, player_type } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
    if (player_type && !['person', 'shop'].includes(player_type)) {
      return res.status(400).json({ error: 'player_type must be "person" or "shop"' })
    }

    const patch: { name: string; player_type?: 'person' | 'shop' } = { name: name.trim() }
    if (player_type) patch.player_type = player_type

    const [updated] = await db.update(playersTable).set(patch).where(eq(playersTable.id, id)).returning()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/players/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const [existing] = await db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Player not found' })

    const [settingsRow] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1)).limit(1)
    if (settingsRow?.default_owner_id === id) {
      return res.status(409).json({ error: 'Cannot delete the default owner. Change the default owner in Settings first.' })
    }

    const now = new Date().toISOString()
    await db
      .update(resultsTable)
      .set({ deleted_at: now })
      .where(and(eq(resultsTable.player_id, id), isNull(resultsTable.deleted_at)))

    await db.update(playersTable).set({ deleted_at: now }).where(eq(playersTable.id, id))

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/players/:id/avatar
router.post('/:id/avatar', avatarUpload.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const [existing] = await db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Player not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    if (existing.avatar_path) {
      const oldPath = path.join(DATA_DIR, existing.avatar_path.replace(/^\/files\//, ''))
      if (existsSync(oldPath)) unlinkSync(oldPath)
    }

    const avatar_path = `/files/avatars/${req.file.filename}`
    const [updated] = await db.update(playersTable).set({ avatar_path }).where(eq(playersTable.id, id)).returning()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

export default router
