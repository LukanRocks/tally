import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and, gte, lte, desc, asc, sql } from 'drizzle-orm'
import path from 'path'
import { existsSync, unlinkSync } from 'fs'
import { db, DATA_DIR } from '../db'
import { games as gamesTable, game_attachments as attachmentsTable, sessions as sessionsTable, session_results as resultsTable, players as playersTable } from '../db/schema'
import { searchLike } from '../db/search'
import { coverUpload, attachmentUpload } from '../middleware/upload'

const router = Router()

// GET /api/v1/games
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, sort = 'name', order = 'asc', minPlayers, maxPlayers, ownerId } = req.query

    const sessionCount = sql<number>`(SELECT COUNT(*) FROM sessions WHERE sessions.game_id = games.id AND sessions.deleted_at IS NULL)`

    const sortMap: Record<string, any> = {
      name: order === 'desc' ? desc(gamesTable.name) : asc(gamesTable.name),
      date_added: order === 'asc' ? asc(gamesTable.created_at) : desc(gamesTable.created_at),
      most_played: order === 'asc' ? asc(sessionCount) : desc(sessionCount),
      price: order === 'asc' ? asc(gamesTable.price) : desc(gamesTable.price),
    }

    const rows = await db
      .select({
        id: gamesTable.id,
        name: gamesTable.name,
        description: gamesTable.description,
        min_players: gamesTable.min_players,
        max_players: gamesTable.max_players,
        purchase_at: gamesTable.purchase_at,
        price: gamesTable.price,
        cover_image_path: gamesTable.cover_image_path,
        owner_id: gamesTable.owner_id,
        owner_name: sql<string | null>`(SELECT name FROM players WHERE players.id = games.owner_id)`,
        owner_player_type: sql<'person' | 'shop' | null>`(SELECT player_type FROM players WHERE players.id = games.owner_id)`,
        created_at: gamesTable.created_at,
        session_count: sessionCount,
      })
      .from(gamesTable)
      .where(
        and(
          isNull(gamesTable.deleted_at),
          search ? searchLike(gamesTable.name, search as string) : undefined,
          minPlayers ? gte(gamesTable.min_players, Number(minPlayers)) : undefined,
          maxPlayers ? lte(gamesTable.max_players, Number(maxPlayers)) : undefined,
          ownerId ? eq(gamesTable.owner_id, Number(ownerId)) : undefined,
        ),
      )
      .orderBy(sortMap[sort as string] ?? asc(gamesTable.name))

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/games/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const [game] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!game) return res.status(404).json({ error: 'Game not found' })

    const attachments = await db
      .select()
      .from(attachmentsTable)
      .where(and(eq(attachmentsTable.game_id, id), isNull(attachmentsTable.deleted_at)))

    const [countRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sessionsTable)
      .where(and(eq(sessionsTable.game_id, id), isNull(sessionsTable.deleted_at)))
      .limit(1)

    const [ownerRow] = game.owner_id
      ? await db.select({ name: playersTable.name, player_type: playersTable.player_type }).from(playersTable).where(eq(playersTable.id, game.owner_id)).limit(1)
      : []

    res.json({ ...game, owner_name: ownerRow?.name ?? null, owner_player_type: ownerRow?.player_type ?? null, attachments, session_count: countRow?.count ?? 0 })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/games
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, quick_rules, min_players, max_players, purchase_at, price, owner_id, bgg_id, year_published } = req.body

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

    const [game] = await db
      .insert(gamesTable)
      .values({
        name: name.trim(),
        description: description || null,
        quick_rules: quick_rules || null,
        min_players: min_players ? Number(min_players) : null,
        max_players: max_players ? Number(max_players) : null,
        purchase_at: purchase_at || null,
        price: price != null ? Number(price) : null,
        owner_id: owner_id ? Number(owner_id) : null,
        bgg_id: bgg_id ? Number(bgg_id) : null,
        year_published: year_published ? Number(year_published) : null,
      })
      .returning()

    res.status(201).json(game)
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/games/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const [existing] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Game not found' })

    const body = req.body
    const patch: Record<string, any> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) patch.name = body.name
    if (body.description !== undefined) patch.description = body.description || null
    if (body.quick_rules !== undefined) patch.quick_rules = body.quick_rules || null
    if (body.min_players !== undefined) patch.min_players = body.min_players ? Number(body.min_players) : null
    if (body.max_players !== undefined) patch.max_players = body.max_players ? Number(body.max_players) : null
    if (body.purchase_at !== undefined) patch.purchase_at = body.purchase_at || null
    if (body.price !== undefined) patch.price = body.price != null ? Number(body.price) : null
    if (body.owner_id !== undefined) patch.owner_id = body.owner_id ? Number(body.owner_id) : null
    if (body.bgg_id !== undefined) patch.bgg_id = body.bgg_id ? Number(body.bgg_id) : null
    if (body.year_published !== undefined) patch.year_published = body.year_published ? Number(body.year_published) : null

    const [updated] = await db.update(gamesTable).set(patch).where(eq(gamesTable.id, id)).returning()
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/games/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const now = new Date().toISOString()

    const [existing] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Game not found' })

    const gameSessions = await db
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(and(eq(sessionsTable.game_id, id), isNull(sessionsTable.deleted_at)))

    for (const s of gameSessions) {
      await db
        .update(resultsTable)
        .set({ deleted_at: now })
        .where(and(eq(resultsTable.session_id, s.id), isNull(resultsTable.deleted_at)))
    }

    await db
      .update(sessionsTable)
      .set({ deleted_at: now })
      .where(and(eq(sessionsTable.game_id, id), isNull(sessionsTable.deleted_at)))

    await db
      .update(attachmentsTable)
      .set({ deleted_at: now })
      .where(and(eq(attachmentsTable.game_id, id), isNull(attachmentsTable.deleted_at)))

    await db.update(gamesTable).set({ deleted_at: now, updated_at: now }).where(eq(gamesTable.id, id))

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/games/:id/cover
router.post('/:id/cover', coverUpload.single('cover'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const [existing] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Game not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    if (existing.cover_image_path) {
      const oldPath = path.join(DATA_DIR, existing.cover_image_path.replace(/^\/files\//, ''))
      if (existsSync(oldPath)) unlinkSync(oldPath)
    }

    const cover_image_path = `/files/covers/${req.file.filename}`
    const [updated] = await db.update(gamesTable).set({ cover_image_path, updated_at: new Date().toISOString() }).where(eq(gamesTable.id, id)).returning()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/games/:id/attachments
router.post('/:id/attachments', attachmentUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const { label } = req.body

    const [existing] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Game not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    if (!label?.trim()) return res.status(400).json({ error: 'Label is required' })

    const [attachment] = await db
      .insert(attachmentsTable)
      .values({
        game_id: id,
        label: label.trim(),
        file_path: `/files/attachments/${req.file.filename}`,
      })
      .returning()

    res.status(201).json(attachment)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/games/:id/attachments/:aid
router.delete('/:id/attachments/:aid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const aid = Number(req.params.aid)

    const [existing] = await db
      .select()
      .from(attachmentsTable)
      .where(and(eq(attachmentsTable.id, aid), eq(attachmentsTable.game_id, id), isNull(attachmentsTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Attachment not found' })

    await db.update(attachmentsTable).set({ deleted_at: new Date().toISOString() }).where(eq(attachmentsTable.id, aid))

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
