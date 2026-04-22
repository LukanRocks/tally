import { Router, Request, Response, NextFunction } from 'express'
import { eq, isNull, and, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { players as playersTable, session_results as resultsTable, sessions as sessionsTable, games as gamesTable } from '../db/schema'

const router = Router()

// GET /api/v1/stats/leaderboard
router.get('/leaderboard', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .select({
        player_id: playersTable.id,
        player_name: playersTable.name,
        avatar_path: playersTable.avatar_path,
        total_points: sql<number>`COALESCE(SUM(CASE WHEN ${sessionsTable.id} IS NOT NULL THEN ${resultsTable.points_awarded} END), 0)`,
        wins: sql<number>`COALESCE(SUM(CASE WHEN ${sessionsTable.id} IS NOT NULL AND ${resultsTable.rank} = 1 THEN 1 ELSE 0 END), 0)`,
        total_sessions: sql<number>`COUNT(DISTINCT ${sessionsTable.id})`,
        win_rate: sql<number>`CASE WHEN COUNT(DISTINCT ${sessionsTable.id}) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN ${sessionsTable.id} IS NOT NULL AND ${resultsTable.rank} = 1 THEN 1.0 ELSE 0 END) / COUNT(DISTINCT ${sessionsTable.id}) * 100)
        END`,
      })
      .from(playersTable)
      .leftJoin(resultsTable, and(eq(resultsTable.player_id, playersTable.id), isNull(resultsTable.deleted_at)))
      .leftJoin(sessionsTable, and(eq(sessionsTable.id, resultsTable.session_id), isNull(sessionsTable.deleted_at)))
      .where(isNull(playersTable.deleted_at))
      .groupBy(playersTable.id)
      .orderBy(
        desc(sql`COALESCE(SUM(CASE WHEN ${sessionsTable.id} IS NOT NULL THEN ${resultsTable.points_awarded} END), 0)`),
        desc(sql`COALESCE(SUM(CASE WHEN ${sessionsTable.id} IS NOT NULL AND ${resultsTable.rank} = 1 THEN 1 ELSE 0 END), 0)`),
        sql`COALESCE(MIN(CASE WHEN ${resultsTable.rank} = 1 THEN ${sessionsTable.played_at} END), '9999-12-31T23:59:59') ASC`,
      )
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/stats/leaderboard/game/:gameId
router.get('/leaderboard/game/:gameId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = Number(req.params.gameId)

    const rows = db
      .select({
        player_id: playersTable.id,
        player_name: playersTable.name,
        avatar_path: playersTable.avatar_path,
        total_points: sql<number>`COALESCE(SUM(${resultsTable.points_awarded}), 0)`,
        wins: sql<number>`COALESCE(SUM(CASE WHEN ${resultsTable.rank} = 1 THEN 1 ELSE 0 END), 0)`,
        total_sessions: sql<number>`COUNT(DISTINCT ${sessionsTable.id})`,
      })
      .from(playersTable)
      .innerJoin(resultsTable, and(eq(resultsTable.player_id, playersTable.id), isNull(resultsTable.deleted_at)))
      .innerJoin(sessionsTable, and(eq(sessionsTable.id, resultsTable.session_id), eq(sessionsTable.game_id, gameId), isNull(sessionsTable.deleted_at)))
      .where(isNull(playersTable.deleted_at))
      .groupBy(playersTable.id)
      .orderBy(
        desc(sql`COALESCE(SUM(${resultsTable.points_awarded}), 0)`),
        desc(sql`COALESCE(SUM(CASE WHEN ${resultsTable.rank} = 1 THEN 1 ELSE 0 END), 0)`),
        sql`COALESCE(MIN(CASE WHEN ${resultsTable.rank} = 1 THEN ${sessionsTable.played_at} END), '9999-12-31T23:59:59') ASC`,
      )
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/stats/most-played
router.get('/most-played', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .select({
        id: gamesTable.id,
        name: gamesTable.name,
        cover_image_path: gamesTable.cover_image_path,
        session_count: sql<number>`COUNT(DISTINCT ${sessionsTable.id})`,
        unique_players: sql<number>`COUNT(DISTINCT ${resultsTable.player_id})`,
      })
      .from(gamesTable)
      .leftJoin(sessionsTable, and(eq(sessionsTable.game_id, gamesTable.id), isNull(sessionsTable.deleted_at)))
      .leftJoin(resultsTable, and(eq(resultsTable.session_id, sessionsTable.id), isNull(resultsTable.deleted_at)))
      .where(isNull(gamesTable.deleted_at))
      .groupBy(gamesTable.id)
      .orderBy(desc(sql`COUNT(DISTINCT ${sessionsTable.id})`))
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/stats/head-to-head?player1=:id&player2=:id
router.get('/head-to-head', (req: Request, res: Response, next: NextFunction) => {
  try {
    const p1 = Number(req.query.player1)
    const p2 = Number(req.query.player2)

    if (!p1 || !p2) return res.status(400).json({ error: 'player1 and player2 are required' })
    if (p1 === p2) return res.status(400).json({ error: 'Players must be different' })

    const player1 = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, p1), isNull(playersTable.deleted_at)))
      .get()
    const player2 = db
      .select()
      .from(playersTable)
      .where(and(eq(playersTable.id, p2), isNull(playersTable.deleted_at)))
      .get()

    if (!player1 || !player2) return res.status(404).json({ error: 'Player not found' })

    const sharedSessions = db
      .select({
        session_id: sessionsTable.id,
        played_at: sessionsTable.played_at,
        game_name: sql<string>`(SELECT name FROM games WHERE id = sessions.game_id)`,
        p1_rank: sql<number>`(SELECT rank FROM session_results WHERE session_id = sessions.id AND player_id = ${p1} AND deleted_at IS NULL)`,
        p1_points: sql<number>`(SELECT points_awarded FROM session_results WHERE session_id = sessions.id AND player_id = ${p1} AND deleted_at IS NULL)`,
        p2_rank: sql<number>`(SELECT rank FROM session_results WHERE session_id = sessions.id AND player_id = ${p2} AND deleted_at IS NULL)`,
        p2_points: sql<number>`(SELECT points_awarded FROM session_results WHERE session_id = sessions.id AND player_id = ${p2} AND deleted_at IS NULL)`,
      })
      .from(sessionsTable)
      .where(
        and(
          isNull(sessionsTable.deleted_at),
          sql`EXISTS (SELECT 1 FROM session_results WHERE session_id = sessions.id AND player_id = ${p1} AND deleted_at IS NULL)`,
          sql`EXISTS (SELECT 1 FROM session_results WHERE session_id = sessions.id AND player_id = ${p2} AND deleted_at IS NULL)`,
        ),
      )
      .all()

    const p1Wins = sharedSessions.filter((s) => s.p1_rank < s.p2_rank).length
    const p2Wins = sharedSessions.filter((s) => s.p2_rank < s.p1_rank).length

    res.json({
      player1: { id: player1.id, name: player1.name, avatar_path: player1.avatar_path },
      player2: { id: player2.id, name: player2.name, avatar_path: player2.avatar_path },
      shared_sessions: sharedSessions.length,
      p1_wins: p1Wins,
      p2_wins: p2Wins,
      sessions: sharedSessions,
    })
  } catch (err) {
    next(err)
  }
})

export default router
