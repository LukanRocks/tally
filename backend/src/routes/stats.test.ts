import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb, createPlayer, createGame, createSession } from '../test/helpers'

describe('stats', () => {
  beforeEach(() => resetDb())

  describe('GET /api/v1/stats/leaderboard', () => {
    it('ranks by points, then wins, and computes win_rate', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const cleo = await createPlayer('Cleo')
      const game = await createGame('Catan')

      // Ada wins one; Bob wins one and also places second once.
      await createSession(
        game.id,
        [
          { player_id: ada.id, rank: 1 },
          { player_id: bob.id, rank: 2 },
        ],
        '2026-01-01T18:00:00.000Z',
      )
      await createSession(
        game.id,
        [
          { player_id: bob.id, rank: 1 },
          { player_id: cleo.id, rank: 2 },
        ],
        '2026-02-01T18:00:00.000Z',
      )

      const res = await request(testApp()).get('/api/v1/stats/leaderboard')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([
        expect.objectContaining({ player_id: bob.id, player_name: 'Bob', total_points: 4, wins: 1, total_sessions: 2, win_rate: 50 }),
        expect.objectContaining({ player_id: ada.id, player_name: 'Ada', total_points: 3, wins: 1, total_sessions: 1, win_rate: 100 }),
        expect.objectContaining({ player_id: cleo.id, player_name: 'Cleo', total_points: 1, wins: 0, total_sessions: 1, win_rate: 0 }),
      ])
    })

    it('includes players with no sessions at zero', async () => {
      await createPlayer('Ada')

      const res = await request(testApp()).get('/api/v1/stats/leaderboard')

      expect(res.body).toEqual([expect.objectContaining({ player_name: 'Ada', total_points: 0, wins: 0, total_sessions: 0, win_rate: 0 })])
    })

    it('excludes shop players and soft-deleted players', async () => {
      await createPlayer('Ada')
      await createPlayer('Cafe', 'shop')
      const gone = await createPlayer('Gone')
      await request(testApp()).delete(`/api/v1/players/${gone.id}`)

      const res = await request(testApp()).get('/api/v1/stats/leaderboard')

      expect(res.body.map((r: { player_name: string }) => r.player_name)).toEqual(['Ada'])
    })

    it('excludes soft-deleted sessions from the totals', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      const session = await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
      await request(testApp()).delete(`/api/v1/sessions/${session.id}`)

      const res = await request(testApp()).get('/api/v1/stats/leaderboard')

      expect(res.body).toEqual([
        expect.objectContaining({ player_name: 'Ada', total_points: 0, total_sessions: 0 }),
        expect.objectContaining({ player_name: 'Bob', total_points: 0, total_sessions: 0 }),
      ])
    })
  })

  describe('GET /api/v1/stats/leaderboard/game/:gameId', () => {
    it('scopes the leaderboard to one game', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const catan = await createGame('Catan')
      const chess = await createGame('Chess')

      await createSession(catan.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
      await createSession(chess.id, [
        { player_id: bob.id, rank: 1 },
        { player_id: ada.id, rank: 2 },
      ])

      const res = await request(testApp()).get(`/api/v1/stats/leaderboard/game/${catan.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([
        expect.objectContaining({ player_id: ada.id, total_points: 3, wins: 1, total_sessions: 1 }),
        expect.objectContaining({ player_id: bob.id, total_points: 1, wins: 0, total_sessions: 1 }),
      ])
    })

    it('returns an empty list for a game with no sessions', async () => {
      await createPlayer('Ada')
      const game = await createGame('Catan')

      const res = await request(testApp()).get(`/api/v1/stats/leaderboard/game/${game.id}`)

      expect(res.body).toEqual([])
    })
  })

  describe('most-played and least-played', () => {
    beforeEach(async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const catan = await createGame('Catan')
      await createGame('Chess')

      await createSession(catan.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
      await createSession(catan.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
    })

    it('orders most-played by session count descending', async () => {
      const res = await request(testApp()).get('/api/v1/stats/most-played')

      expect(res.status).toBe(200)
      expect(res.body[0]).toMatchObject({ name: 'Catan', session_count: 2, unique_players: 2 })
      expect(res.body[1]).toMatchObject({ name: 'Chess', session_count: 0, unique_players: 0 })
    })

    it('orders least-played by session count ascending', async () => {
      const res = await request(testApp()).get('/api/v1/stats/least-played')

      expect(res.status).toBe(200)
      expect(res.body[0]).toMatchObject({ name: 'Chess', session_count: 0 })
      expect(res.body[1]).toMatchObject({ name: 'Catan', session_count: 2 })
    })
  })

  describe('GET /api/v1/stats/head-to-head', () => {
    it('summarises shared sessions between two players', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const cleo = await createPlayer('Cleo')
      const game = await createGame('Catan')

      // Two shared sessions, one each; plus a session Bob is not part of.
      await createSession(
        game.id,
        [
          { player_id: ada.id, rank: 1 },
          { player_id: bob.id, rank: 2 },
        ],
        '2026-01-01T18:00:00.000Z',
      )
      await createSession(
        game.id,
        [
          { player_id: bob.id, rank: 1 },
          { player_id: ada.id, rank: 2 },
        ],
        '2026-02-01T18:00:00.000Z',
      )
      await createSession(
        game.id,
        [
          { player_id: ada.id, rank: 1 },
          { player_id: cleo.id, rank: 2 },
        ],
        '2026-03-01T18:00:00.000Z',
      )

      const res = await request(testApp()).get(`/api/v1/stats/head-to-head?player1=${ada.id}&player2=${bob.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        player1: { id: ada.id, name: 'Ada' },
        player2: { id: bob.id, name: 'Bob' },
        shared_sessions: 2,
        p1_wins: 1,
        p2_wins: 1,
      })
      expect(res.body.sessions).toHaveLength(2)
      expect(res.body.sessions[0]).toMatchObject({ game_name: 'Catan', p1_rank: 1, p2_rank: 2 })
    })

    it('reports zero when the two players never met', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')

      const res = await request(testApp()).get(`/api/v1/stats/head-to-head?player1=${ada.id}&player2=${bob.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ shared_sessions: 0, p1_wins: 0, p2_wins: 0, sessions: [] })
    })

    it.each([
      ['a missing player2', (a: number) => `?player1=${a}`, 400, 'player1 and player2 are required'],
      ['the same player twice', (a: number) => `?player1=${a}&player2=${a}`, 400, 'Players must be different'],
      ['an unknown player', (a: number) => `?player1=${a}&player2=999`, 404, 'Player not found'],
    ])('rejects %s', async (_label, buildQuery, status, error) => {
      const ada = await createPlayer('Ada')

      const res = await request(testApp()).get(`/api/v1/stats/head-to-head${buildQuery(ada.id)}`)

      expect(res.status).toBe(status)
      expect(res.body).toEqual({ error })
    })

    it('refuses head-to-head against a shop player', async () => {
      const ada = await createPlayer('Ada')
      const shop = await createPlayer('Cafe', 'shop')

      const res = await request(testApp()).get(`/api/v1/stats/head-to-head?player1=${ada.id}&player2=${shop.id}`)

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Head-to-head is only available for person-type players' })
    })
  })
})
