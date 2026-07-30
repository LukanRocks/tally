import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb, createPlayer, createGame, createSession } from '../test/helpers'

describe('players', () => {
  beforeEach(() => resetDb())

  describe('POST /api/v1/players', () => {
    it('creates a player defaulting to person', async () => {
      const res = await request(await testApp())
        .post('/api/v1/players')
        .send({ name: 'Ada' })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ id: 1, name: 'Ada', player_type: 'person', avatar_path: null, deleted_at: null })
      expect(res.body.created_at).toEqual(expect.any(String))
    })

    it('accepts an explicit shop type and trims the name', async () => {
      const res = await request(await testApp())
        .post('/api/v1/players')
        .send({ name: '  Board Game Cafe  ', player_type: 'shop' })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ name: 'Board Game Cafe', player_type: 'shop' })
    })

    it('allows duplicate names', async () => {
      await createPlayer('Ada')
      const res = await request(await testApp())
        .post('/api/v1/players')
        .send({ name: 'Ada' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBe(2)
    })

    it.each([
      ['missing name', {}, 'Name is required'],
      ['blank name', { name: '   ' }, 'Name is required'],
      ['bad player_type', { name: 'Ada', player_type: 'robot' }, 'player_type must be "person" or "shop"'],
    ])('rejects %s', async (_label, body, error) => {
      const res = await request(await testApp())
        .post('/api/v1/players')
        .send(body)

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error })
    })
  })

  describe('GET /api/v1/players', () => {
    it('returns an empty list initially', async () => {
      const res = await request(await testApp()).get('/api/v1/players')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('aggregates points and session counts per player', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      const res = await request(await testApp()).get('/api/v1/players')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      // 2 players: rank 1 scores 3, rank 2 scores 1
      expect(res.body[0]).toMatchObject({ id: ada.id, name: 'Ada', total_points: 3, total_sessions: 1 })
      expect(res.body[1]).toMatchObject({ id: bob.id, name: 'Bob', total_points: 1, total_sessions: 1 })
    })

    it('omits soft-deleted players', async () => {
      const ada = await createPlayer('Ada')
      await createPlayer('Bob')
      await request(await testApp()).delete(`/api/v1/players/${ada.id}`)

      const res = await request(await testApp()).get('/api/v1/players')

      expect(res.body.map((p: { name: string }) => p.name)).toEqual(['Bob'])
    })
  })

  describe('GET /api/v1/players/:id', () => {
    it('returns win_rate and zeroed stats for a player with no sessions', async () => {
      const ada = await createPlayer('Ada')

      const res = await request(await testApp()).get(`/api/v1/players/${ada.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ id: ada.id, name: 'Ada', total_points: 0, total_sessions: 0, win_rate: 0 })
    })

    it('computes win_rate across sessions', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
      await createSession(game.id, [
        { player_id: ada.id, rank: 2 },
        { player_id: bob.id, rank: 1 },
      ])

      const res = await request(await testApp()).get(`/api/v1/players/${ada.id}`)

      expect(res.body).toMatchObject({ total_points: 4, total_sessions: 2, wins: 1, win_rate: 50 })
    })

    it('404s for unknown and soft-deleted players', async () => {
      const ada = await createPlayer('Ada')
      await request(await testApp()).delete(`/api/v1/players/${ada.id}`)

      expect((await request(await testApp()).get('/api/v1/players/999')).status).toBe(404)
      expect((await request(await testApp()).get(`/api/v1/players/${ada.id}`)).status).toBe(404)
    })
  })

  describe('PUT /api/v1/players/:id', () => {
    it('updates name and type', async () => {
      const ada = await createPlayer('Ada')

      const res = await request(await testApp())
        .put(`/api/v1/players/${ada.id}`)
        .send({ name: 'Ada L.', player_type: 'shop' })

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ id: ada.id, name: 'Ada L.', player_type: 'shop' })
    })

    it('leaves player_type untouched when omitted', async () => {
      const shop = await createPlayer('Cafe', 'shop')

      const res = await request(await testApp())
        .put(`/api/v1/players/${shop.id}`)
        .send({ name: 'Cafe 2' })

      expect(res.body).toMatchObject({ name: 'Cafe 2', player_type: 'shop' })
    })

    it('validates and 404s', async () => {
      const ada = await createPlayer('Ada')

      expect(
        (
          await request(await testApp())
            .put(`/api/v1/players/${ada.id}`)
            .send({ name: '' })
        ).status,
      ).toBe(400)
      expect(
        (
          await request(await testApp())
            .put(`/api/v1/players/${ada.id}`)
            .send({ name: 'Ada', player_type: 'robot' })
        ).status,
      ).toBe(400)
      expect(
        (
          await request(await testApp())
            .put('/api/v1/players/999')
            .send({ name: 'Nobody' })
        ).status,
      ).toBe(404)
    })
  })

  describe('DELETE /api/v1/players/:id', () => {
    it('soft-deletes the player and their results', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      const session = await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      const res = await request(await testApp()).delete(`/api/v1/players/${ada.id}`)
      expect(res.status).toBe(204)

      // The session survives, but Ada's result row is gone from it.
      const detail = await request(await testApp()).get(`/api/v1/sessions/${session.id}`)
      expect(detail.status).toBe(200)
      expect(detail.body.results.map((r: { player_id: number }) => r.player_id)).toEqual([bob.id])
    })

    it('refuses to delete the configured default owner', async () => {
      const ada = await createPlayer('Ada')
      await request(await testApp())
        .put('/api/v1/settings')
        .send({ default_owner_id: ada.id })

      const res = await request(await testApp()).delete(`/api/v1/players/${ada.id}`)

      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/default owner/i)
      expect((await request(await testApp()).get(`/api/v1/players/${ada.id}`)).status).toBe(200)
    })

    it('404s for unknown players', async () => {
      expect((await request(await testApp()).delete('/api/v1/players/999')).status).toBe(404)
    })
  })
})
