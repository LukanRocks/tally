import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb, createPlayer, createGame, createSession } from '../test/helpers'

describe('sessions', () => {
  beforeEach(() => resetDb())

  describe('POST /api/v1/sessions', () => {
    it('creates a session and awards points by rank', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const cleo = await createPlayer('Cleo')
      const game = await createGame('Catan')

      const res = await request(await testApp())
        .post('/api/v1/sessions')
        .send({
          game_id: game.id,
          played_at: '2026-03-01T18:00:00.000Z',
          notes: 'Close one',
          results: [
            { player_id: ada.id, rank: 1 },
            { player_id: bob.id, rank: 2 },
            { player_id: cleo.id, rank: 3 },
          ],
        })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ game_id: game.id, played_at: '2026-03-01T18:00:00.000Z', notes: 'Close one' })

      // 3 players: winner gets N + 1 = 4, then 2, then 1.
      const detail = await request(await testApp()).get(`/api/v1/sessions/${res.body.id}`)
      expect(detail.body.results).toEqual([
        expect.objectContaining({ player_id: ada.id, player_name: 'Ada', rank: 1, points_awarded: 4 }),
        expect.objectContaining({ player_id: bob.id, player_name: 'Bob', rank: 2, points_awarded: 2 }),
        expect.objectContaining({ player_id: cleo.id, player_name: 'Cleo', rank: 3, points_awarded: 1 }),
      ])
    })

    it('awards 3 and 1 for a two-player session', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Chess')

      const session = await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      const detail = await request(await testApp()).get(`/api/v1/sessions/${session.id}`)
      expect(detail.body.results.map((r: { points_awarded: number }) => r.points_awarded)).toEqual([3, 1])
    })

    it('nulls empty notes', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Chess')

      const res = await request(await testApp())
        .post('/api/v1/sessions')
        .send({
          game_id: game.id,
          played_at: '2026-03-01T18:00:00.000Z',
          results: [
            { player_id: ada.id, rank: 1 },
            { player_id: bob.id, rank: 2 },
          ],
        })

      expect(res.body.notes).toBeNull()
    })

    it.each([
      ['missing game_id', { played_at: '2026-03-01', results: [] }, 'game_id is required'],
      ['missing played_at', { game_id: 1, results: [] }, 'played_at is required'],
    ])('rejects %s', async (_label, body, error) => {
      const res = await request(await testApp())
        .post('/api/v1/sessions')
        .send(body)

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error })
    })

    it('requires at least two players', async () => {
      const ada = await createPlayer('Ada')
      const game = await createGame('Chess')

      const res = await request(await testApp())
        .post('/api/v1/sessions')
        .send({ game_id: game.id, played_at: '2026-03-01', results: [{ player_id: ada.id, rank: 1 }] })

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'At least 2 players are required' })
    })

    it.each([
      ['duplicate ranks', [1, 1]],
      ['a gap in the ranks', [1, 3]],
      ['ranks not starting at 1', [2, 3]],
    ])('rejects %s', async (_label, ranks) => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Chess')

      const res = await request(await testApp())
        .post('/api/v1/sessions')
        .send({
          game_id: game.id,
          played_at: '2026-03-01',
          results: [
            { player_id: ada.id, rank: ranks[0] },
            { player_id: bob.id, rank: ranks[1] },
          ],
        })

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Ranks must be unique integers from 1 to N' })
    })

    it('404s for an unknown or soft-deleted game', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Chess')
      await request(await testApp()).delete(`/api/v1/games/${game.id}`)

      const results = [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ]

      expect(
        (
          await request(await testApp())
            .post('/api/v1/sessions')
            .send({ game_id: 999, played_at: '2026-03-01', results })
        ).status,
      ).toBe(404)
      expect(
        (
          await request(await testApp())
            .post('/api/v1/sessions')
            .send({ game_id: game.id, played_at: '2026-03-01', results })
        ).status,
      ).toBe(404)
    })
  })

  describe('GET /api/v1/sessions', () => {
    it('lists sessions with game name and player count', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      const res = await request(await testApp()).get('/api/v1/sessions')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toMatchObject({ game_id: game.id, game_name: 'Catan', player_count: 2 })
    })

    it('returns an empty list initially', async () => {
      expect((await request(await testApp()).get('/api/v1/sessions')).body).toEqual([])
    })
  })

  describe('GET /api/v1/sessions/:id', () => {
    it('404s for unknown sessions', async () => {
      expect((await request(await testApp()).get('/api/v1/sessions/999')).status).toBe(404)
    })
  })

  describe('DELETE /api/v1/sessions/:id', () => {
    it('soft-deletes the session and its results', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      const session = await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      expect((await request(await testApp()).delete(`/api/v1/sessions/${session.id}`)).status).toBe(204)

      expect((await request(await testApp()).get(`/api/v1/sessions/${session.id}`)).status).toBe(404)
      expect((await request(await testApp()).get('/api/v1/sessions')).body).toEqual([])
      expect((await request(await testApp()).get(`/api/v1/players/${ada.id}`)).body).toMatchObject({ total_points: 0, total_sessions: 0 })
    })

    it('404s for unknown sessions', async () => {
      expect((await request(await testApp()).delete('/api/v1/sessions/999')).status).toBe(404)
    })
  })
})
