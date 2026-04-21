import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and, sql } from 'drizzle-orm'
import path from 'path'
import { existsSync, unlinkSync } from 'fs'
import { db, DATA_DIR } from '../db'
import { players as playersTable, session_results as resultsTable } from '../db/schema'
import { avatarUpload } from '../middleware/upload'

const router = Router()

// GET /api/v1/players
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        avatar_path: playersTable.avatar_path,
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
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/players/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const player = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .get()

    if (!player) return res.status(404).json({ error: 'Player not found' })

    const stats = db
      .select({
        total_points: sql<number>`COALESCE(SUM(points_awarded), 0)`,
        total_sessions: sql<number>`COUNT(DISTINCT session_id)`,
        wins: sql<number>`SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END)`,
      })
      .from(resultsTable)
      .where(and(eq(resultsTable.player_id, id), isNull(resultsTable.deleted_at)))
      .get()

    const win_rate = stats && stats.total_sessions > 0 ? Math.round((stats.wins / stats.total_sessions) * 100) : 0

    res.json({ ...player, ...(stats ?? {}), win_rate })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/players
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

    const [player] = db.insert(playersTable).values({ name: name.trim() }).returning().all()
    res.status(201).json(player)
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/players/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const existing = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .get()

    if (!existing) return res.status(404).json({ error: 'Player not found' })

    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

    const [updated] = db.update(playersTable).set({ name: name.trim() }).where(eq(playersTable.id, id)).returning().all()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/players/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const existing = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .get()

    if (!existing) return res.status(404).json({ error: 'Player not found' })

    const now = new Date().toISOString()
    db.update(resultsTable)
      .set({ deleted_at: now })
      .where(and(eq(resultsTable.player_id, id), isNull(resultsTable.deleted_at)))
      .run()

    db.update(playersTable).set({ deleted_at: now }).where(eq(playersTable.id, id)).run()

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/players/:id/avatar
router.post('/:id/avatar', avatarUpload.single('avatar'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const existing = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, id), isNull(playersTable.deleted_at)))
      .get()

    if (!existing) return res.status(404).json({ error: 'Player not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    if (existing.avatar_path) {
      const oldPath = path.join(DATA_DIR, existing.avatar_path.replace(/^\/files\//, ''))
      if (existsSync(oldPath)) unlinkSync(oldPath)
    }

    const avatar_path = `/files/avatars/${req.file.filename}`
    const [updated] = db.update(playersTable).set({ avatar_path }).where(eq(playersTable.id, id)).returning().all()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

export default router
