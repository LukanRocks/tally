import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { request, testApp, resetDb } from '../test/helpers'
import { dialect } from '../db'
import { __resetStateForTests, __setStateForTests, markReady, getState } from '../db/state'

const SOURCE = { games: 12, players: 4, sessions: 30 }

describe('system routes', () => {
  beforeEach(async () => {
    await resetDb()
    __resetStateForTests()
  })

  afterEach(() => markReady())

  describe('GET /api/v1/system/db-status', () => {
    it('reports READY with the active dialect', async () => {
      const res = await request(await testApp()).get('/api/v1/system/db-status')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ state: 'READY', dialect, source: null, lastError: null })
    })

    it('reports the source row counts while an import is pending', async () => {
      __setStateForTests('PENDING_IMPORT', SOURCE)

      const res = await request(await testApp()).get('/api/v1/system/db-status')

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ state: 'PENDING_IMPORT', source: SOURCE })
    })
  })

  describe('POST /api/v1/system/import-from-sqlite', () => {
    it('409s when no import is pending', async () => {
      const res = await request(await testApp()).post('/api/v1/system/import-from-sqlite')

      expect(res.status).toBe(409)
      expect(res.body).toEqual({ error: 'No import is pending.' })
    })
  })

  // The whole point of the gate: while PENDING_IMPORT, a user must not be able
  // to write into the empty target while their real data sits in SQLite. If any
  // of these start returning 2xx, data can diverge with nothing to reconcile it.
  describe('the pending-import gate', () => {
    it('serves the data API normally while READY', async () => {
      expect(getState()).toBe('READY')

      expect((await request(await testApp()).get('/api/v1/games')).status).toBe(200)
    })

    it.each([
      ['GET', '/api/v1/games'],
      ['GET', '/api/v1/players'],
      ['GET', '/api/v1/sessions'],
      ['GET', '/api/v1/settings'],
      ['GET', '/api/v1/stats/leaderboard'],
      ['GET', '/api/v1/bgg/search?q=catan'],
    ])('blocks %s %s with 503 while pending', async (method, path) => {
      __setStateForTests('PENDING_IMPORT', SOURCE)

      const res = await request(await testApp())[method.toLowerCase() as 'get'](path)

      expect(res.status).toBe(503)
      expect(res.body).toMatchObject({ state: 'PENDING_IMPORT' })
    })

    it.each([
      ['POST', '/api/v1/players', { name: 'Sneaky' }],
      ['POST', '/api/v1/games', { name: 'Sneaky Game' }],
    ])('blocks writes (%s %s) while pending', async (_method, path, body) => {
      __setStateForTests('PENDING_IMPORT', SOURCE)

      const res = await request(await testApp())
        .post(path)
        .send(body)

      expect(res.status).toBe(503)
    })

    it('leaves nothing behind after a blocked write', async () => {
      __setStateForTests('PENDING_IMPORT', SOURCE)
      await request(await testApp())
        .post('/api/v1/players')
        .send({ name: 'Sneaky' })

      markReady()

      expect((await request(await testApp()).get('/api/v1/players')).body).toEqual([])
    })

    it('keeps the system endpoints reachable so the user can resolve the state', async () => {
      __setStateForTests('PENDING_IMPORT', SOURCE)

      expect((await request(await testApp()).get('/api/v1/system/db-status')).status).toBe(200)
      // Not 503 — reaching the importer is how the state gets resolved at all.
      expect((await request(await testApp()).post('/api/v1/system/import-from-sqlite')).status).not.toBe(503)
    })
  })
})
