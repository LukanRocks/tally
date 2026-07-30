import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb, createPlayer, createGame, createSession } from '../test/helpers'

const PNG = Buffer.from('89504e470d0a1a0a', 'hex')
const PDF = Buffer.from('%PDF-1.4 test')

describe('games', () => {
  beforeEach(() => resetDb())

  describe('POST /api/v1/games', () => {
    it('creates a game with all optional fields', async () => {
      const owner = await createPlayer('Ada')

      const res = await request(testApp()).post('/api/v1/games').send({
        name: '  Catan  ',
        description: 'Trading',
        quick_rules: 'Roll and build',
        min_players: 3,
        max_players: 4,
        purchase_at: '2026-01-01',
        price: 42.5,
        owner_id: owner.id,
        bgg_id: 13,
        year_published: 1995,
      })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({
        id: 1,
        name: 'Catan',
        description: 'Trading',
        min_players: 3,
        max_players: 4,
        price: 42.5,
        owner_id: owner.id,
        bgg_id: 13,
        year_published: 1995,
        deleted_at: null,
      })
    })

    it('nulls absent optional fields', async () => {
      const res = await request(testApp()).post('/api/v1/games').send({ name: 'Chess' })

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ description: null, min_players: null, max_players: null, price: null, owner_id: null })
    })

    it('rejects a blank name', async () => {
      const res = await request(testApp()).post('/api/v1/games').send({ name: '  ' })

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Name is required' })
    })
  })

  describe('GET /api/v1/games', () => {
    it('includes owner name, type and session count', async () => {
      const owner = await createPlayer('Cafe', 'shop')
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan', { owner_id: owner.id })
      await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      const res = await request(testApp()).get('/api/v1/games')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toMatchObject({ name: 'Catan', owner_name: 'Cafe', owner_player_type: 'shop', session_count: 1 })
    })

    it('sorts by name ascending by default', async () => {
      await createGame('Zendo')
      await createGame('Azul')

      const res = await request(testApp()).get('/api/v1/games')

      expect(res.body.map((g: { name: string }) => g.name)).toEqual(['Azul', 'Zendo'])
    })

    it('honours sort and order parameters', async () => {
      await createGame('Azul', { price: 30 })
      await createGame('Zendo', { price: 10 })

      const byName = await request(testApp()).get('/api/v1/games?sort=name&order=desc')
      expect(byName.body.map((g: { name: string }) => g.name)).toEqual(['Zendo', 'Azul'])

      const byPrice = await request(testApp()).get('/api/v1/games?sort=price&order=asc')
      expect(byPrice.body.map((g: { name: string }) => g.name)).toEqual(['Zendo', 'Azul'])
    })

    it('filters by search, player counts and owner', async () => {
      const owner = await createPlayer('Ada')
      await createGame('Catan', { min_players: 3, max_players: 4, owner_id: owner.id })
      await createGame('Chess', { min_players: 2, max_players: 2 })

      const search = await request(testApp()).get('/api/v1/games?search=cat')
      expect(search.body.map((g: { name: string }) => g.name)).toEqual(['Catan'])

      const min = await request(testApp()).get('/api/v1/games?minPlayers=3')
      expect(min.body.map((g: { name: string }) => g.name)).toEqual(['Catan'])

      const max = await request(testApp()).get('/api/v1/games?maxPlayers=2')
      expect(max.body.map((g: { name: string }) => g.name)).toEqual(['Chess'])

      const byOwner = await request(testApp()).get(`/api/v1/games?ownerId=${owner.id}`)
      expect(byOwner.body.map((g: { name: string }) => g.name)).toEqual(['Catan'])
    })

    // Locks in SQLite's ASCII-case-insensitive LIKE. Postgres LIKE is case
    // SENSITIVE, so this is the assertion that will fail first on the Postgres
    // dialect and force the searchLike() helper. Do not weaken it.
    it('matches search case-insensitively', async () => {
      await createGame('Catan')

      const lower = await request(testApp()).get('/api/v1/games?search=catan')
      const upper = await request(testApp()).get('/api/v1/games?search=CATAN')

      expect(lower.body).toHaveLength(1)
      expect(upper.body).toHaveLength(1)
    })

    it('omits soft-deleted games', async () => {
      const game = await createGame('Catan')
      await createGame('Chess')
      await request(testApp()).delete(`/api/v1/games/${game.id}`)

      const res = await request(testApp()).get('/api/v1/games')

      expect(res.body.map((g: { name: string }) => g.name)).toEqual(['Chess'])
    })
  })

  describe('GET /api/v1/games/:id', () => {
    it('returns the game with attachments and session count', async () => {
      const game = await createGame('Catan')

      const res = await request(testApp()).get(`/api/v1/games/${game.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ id: game.id, name: 'Catan', attachments: [], session_count: 0, owner_name: null, owner_player_type: null })
    })

    it('404s for unknown and soft-deleted games', async () => {
      const game = await createGame('Catan')
      await request(testApp()).delete(`/api/v1/games/${game.id}`)

      expect((await request(testApp()).get('/api/v1/games/999')).status).toBe(404)
      expect((await request(testApp()).get(`/api/v1/games/${game.id}`)).status).toBe(404)
    })
  })

  describe('PUT /api/v1/games/:id', () => {
    it('applies a partial patch and leaves omitted fields alone', async () => {
      const game = await createGame('Catan', { description: 'Trading', price: 40 })

      const res = await request(testApp()).put(`/api/v1/games/${game.id}`).send({ name: 'Catan 5th Ed' })

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ name: 'Catan 5th Ed', description: 'Trading', price: 40 })
    })

    it('clears fields set to empty', async () => {
      const game = await createGame('Catan', { description: 'Trading' })

      const res = await request(testApp()).put(`/api/v1/games/${game.id}`).send({ description: '' })

      expect(res.body.description).toBeNull()
    })

    it('404s for unknown games', async () => {
      expect((await request(testApp()).put('/api/v1/games/999').send({ name: 'Nope' })).status).toBe(404)
    })
  })

  describe('DELETE /api/v1/games/:id', () => {
    it('cascades the soft delete to sessions and results', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      const session = await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])

      expect((await request(testApp()).delete(`/api/v1/games/${game.id}`)).status).toBe(204)

      expect((await request(testApp()).get(`/api/v1/sessions/${session.id}`)).status).toBe(404)
      expect((await request(testApp()).get('/api/v1/sessions')).body).toEqual([])
      // Results are detached too, so the player's totals drop back to zero.
      expect((await request(testApp()).get(`/api/v1/players/${ada.id}`)).body).toMatchObject({ total_points: 0, total_sessions: 0 })
    })

    it('404s for unknown games', async () => {
      expect((await request(testApp()).delete('/api/v1/games/999')).status).toBe(404)
    })
  })

  describe('uploads', () => {
    it('attaches a cover image', async () => {
      const game = await createGame('Catan')

      const res = await request(testApp()).post(`/api/v1/games/${game.id}/cover`).attach('cover', PNG, { filename: 'cover.png', contentType: 'image/png' })

      expect(res.status).toBe(200)
      expect(res.body.cover_image_path).toMatch(/^\/files\/covers\/.+\.png$/)
    })

    it('rejects a cover upload with no file', async () => {
      const game = await createGame('Catan')

      const res = await request(testApp()).post(`/api/v1/games/${game.id}/cover`)

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'No file uploaded' })
    })

    it('adds and removes a PDF attachment', async () => {
      const game = await createGame('Catan')

      const created = await request(testApp())
        .post(`/api/v1/games/${game.id}/attachments`)
        .field('label', 'Rulebook')
        .attach('file', PDF, { filename: 'rules.pdf', contentType: 'application/pdf' })

      expect(created.status).toBe(201)
      expect(created.body).toMatchObject({ game_id: game.id, label: 'Rulebook' })
      expect(created.body.file_path).toMatch(/^\/files\/attachments\/.+\.pdf$/)

      const withAttachment = await request(testApp()).get(`/api/v1/games/${game.id}`)
      expect(withAttachment.body.attachments).toHaveLength(1)

      const removed = await request(testApp()).delete(`/api/v1/games/${game.id}/attachments/${created.body.id}`)
      expect(removed.status).toBe(204)

      const after = await request(testApp()).get(`/api/v1/games/${game.id}`)
      expect(after.body.attachments).toEqual([])
    })

    it('requires a label on attachments', async () => {
      const game = await createGame('Catan')

      const res = await request(testApp()).post(`/api/v1/games/${game.id}/attachments`).attach('file', PDF, { filename: 'rules.pdf', contentType: 'application/pdf' })

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Label is required' })
    })

    it('404s when deleting an attachment that belongs to another game', async () => {
      const game = await createGame('Catan')
      const other = await createGame('Chess')
      const created = await request(testApp())
        .post(`/api/v1/games/${game.id}/attachments`)
        .field('label', 'Rulebook')
        .attach('file', PDF, { filename: 'rules.pdf', contentType: 'application/pdf' })

      const res = await request(testApp()).delete(`/api/v1/games/${other.id}/attachments/${created.body.id}`)

      expect(res.status).toBe(404)
    })
  })
})
