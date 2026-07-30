import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb, createPlayer, createGame, createSession } from '../test/helpers'

describe('settings', () => {
  beforeEach(() => resetDb())

  describe('GET /api/v1/settings', () => {
    it('returns the seeded singleton without exposing its id', async () => {
      const res = await request(testApp()).get('/api/v1/settings')

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        currency: 'USD',
        language: 'en',
        theme: 'system',
        onboarded: false,
        default_owner_id: null,
        bgg_last_updated: null,
      })
      expect(res.body).not.toHaveProperty('id')
    })
  })

  describe('PUT /api/v1/settings', () => {
    it('updates the valid fields', async () => {
      const res = await request(testApp()).put('/api/v1/settings').send({ currency: 'BRL', language: 'pt', theme: 'dark', onboarded: true })

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ currency: 'BRL', language: 'pt', theme: 'dark', onboarded: true })
      expect(res.body).not.toHaveProperty('id')
    })

    it('persists across requests', async () => {
      await request(testApp()).put('/api/v1/settings').send({ theme: 'light' })

      expect((await request(testApp()).get('/api/v1/settings')).body.theme).toBe('light')
    })

    it.each([
      ['currency', { currency: 'EUR' }, 'Invalid currency'],
      ['language', { language: 'fr' }, 'Invalid language'],
      ['theme', { theme: 'neon' }, 'Invalid theme'],
      ['onboarded', { onboarded: 'yes' }, 'Invalid onboarded value'],
    ])('rejects an invalid %s', async (_label, body, error) => {
      const res = await request(testApp()).put('/api/v1/settings').send(body)

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error })
    })

    it('sets and clears the default owner', async () => {
      const ada = await createPlayer('Ada')

      const set = await request(testApp()).put('/api/v1/settings').send({ default_owner_id: ada.id })
      expect(set.body.default_owner_id).toBe(ada.id)

      const cleared = await request(testApp()).put('/api/v1/settings').send({ default_owner_id: null })
      expect(cleared.body.default_owner_id).toBeNull()
    })

    it('404s when the default owner does not exist', async () => {
      const res = await request(testApp()).put('/api/v1/settings').send({ default_owner_id: 999 })

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Player not found' })
    })

    it('404s when the default owner is soft-deleted', async () => {
      const ada = await createPlayer('Ada')
      await request(testApp()).delete(`/api/v1/players/${ada.id}`)

      const res = await request(testApp()).put('/api/v1/settings').send({ default_owner_id: ada.id })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/settings/reset', () => {
    it('wipes every table and restores default settings', async () => {
      const ada = await createPlayer('Ada')
      const bob = await createPlayer('Bob')
      const game = await createGame('Catan')
      await createSession(game.id, [
        { player_id: ada.id, rank: 1 },
        { player_id: bob.id, rank: 2 },
      ])
      await request(testApp()).put('/api/v1/settings').send({ theme: 'dark', currency: 'BRL' })

      const res = await request(testApp()).delete('/api/v1/settings/reset')
      expect(res.status).toBe(204)

      expect((await request(testApp()).get('/api/v1/players')).body).toEqual([])
      expect((await request(testApp()).get('/api/v1/games')).body).toEqual([])
      expect((await request(testApp()).get('/api/v1/sessions')).body).toEqual([])
      expect((await request(testApp()).get('/api/v1/settings')).body).toMatchObject({
        currency: 'USD',
        language: 'en',
        theme: 'system',
        onboarded: false,
        default_owner_id: null,
      })
    })

    it('leaves the settings singleton queryable when nothing exists yet', async () => {
      expect((await request(testApp()).delete('/api/v1/settings/reset')).status).toBe(204)
      expect((await request(testApp()).get('/api/v1/settings')).status).toBe(200)
    })
  })
})
