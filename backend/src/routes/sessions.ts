import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and, sql } from 'drizzle-orm'
import { db, sqlite } from '../db'
import { sessions as sessionsTable, session_results as resultsTable, games as gamesTable } from '../db/schema'

const router = Router()

interface ResultInput {
  player_id: number
  rank: number
}

function calcPoints(n: number, rank: number): number {
  if (n < 2) return 0
  return n - (rank - 1) + (rank === 1 ? 1 : 0)
}

// GET /api/v1/sessions
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db
      .select({
        id: sessionsTable.id,
        game_id: sessionsTable.game_id,
        game_name: sql<string>`(SELECT name FROM games WHERE id = sessions.game_id)`,
        played_at: sessionsTable.played_at,
        notes: sessionsTable.notes,
        created_at: sessionsTable.created_at,
        player_count: sql<number>`(
        SELECT COUNT(*) FROM session_results sr
        WHERE sr.session_id = sessions.id AND sr.deleted_at IS NULL
      )`,
      })
      .from(sessionsTable)
      .where(isNull(sessionsTable.deleted_at))

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/sessions/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), isNull(sessionsTable.deleted_at)))
      .limit(1)

    if (!session) return res.status(404).json({ error: 'Session not found' })

    const results = await db
      .select({
        id: resultsTable.id,
        player_id: resultsTable.player_id,
        player_name: sql<string>`(SELECT name FROM players WHERE id = session_results.player_id)`,
        rank: resultsTable.rank,
        points_awarded: resultsTable.points_awarded,
      })
      .from(resultsTable)
      .where(and(eq(resultsTable.session_id, id), isNull(resultsTable.deleted_at)))

    res.json({ ...session, results })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/sessions
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { game_id, played_at, notes, results } = req.body as {
      game_id: number
      played_at: string
      notes?: string
      results: ResultInput[]
    }

    if (!game_id) return res.status(400).json({ error: 'game_id is required' })
    if (!played_at) return res.status(400).json({ error: 'played_at is required' })
    if (!Array.isArray(results) || results.length < 2) {
      return res.status(400).json({ error: 'At least 2 players are required' })
    }

    const ranks = results.map((r) => r.rank).sort((a, b) => a - b)
    const expected = Array.from({ length: results.length }, (_, i) => i + 1)
    if (JSON.stringify(ranks) !== JSON.stringify(expected)) {
      return res.status(400).json({ error: 'Ranks must be unique integers from 1 to N' })
    }

    const [game] = await db
      .select()
      .from(gamesTable)
      .where(and(eq(gamesTable.id, game_id), isNull(gamesTable.deleted_at)))
      .limit(1)

    if (!game) return res.status(404).json({ error: 'Game not found' })

    // The two terminal calls inside this block stay synchronous on purpose:
    // better-sqlite3's transaction() requires a sync callback, so awaiting here
    // would let the transaction commit before the inserts resolve. They convert
    // in Phase 2, together with the move to db.transaction().
    const createSession = sqlite.transaction(() => {
      const [session] = db
        .insert(sessionsTable)
        .values({
          game_id,
          played_at,
          notes: notes || null,
        })
        .returning()
        .all()

      const N = results.length
      for (const r of results) {
        db.insert(resultsTable)
          .values({
            session_id: session.id,
            player_id: r.player_id,
            rank: r.rank,
            points_awarded: calcPoints(N, r.rank),
          })
          .run()
      }

      return session
    })

    const session = createSession()
    res.status(201).json(session)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/sessions/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const now = new Date().toISOString()

    const [existing] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), isNull(sessionsTable.deleted_at)))
      .limit(1)

    if (!existing) return res.status(404).json({ error: 'Session not found' })

    await db
      .update(resultsTable)
      .set({ deleted_at: now })
      .where(and(eq(resultsTable.session_id, id), isNull(resultsTable.deleted_at)))

    await db.update(sessionsTable).set({ deleted_at: now }).where(eq(sessionsTable.id, id))

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
