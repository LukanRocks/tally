import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { request, testApp, resetDb } from '../test/helpers'
import { dialect } from '../db'
import { describeImportFailure } from './system'
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

    // The decision screen reads this endpoint for its row counts. Without the
    // link here it rendered with nowhere to send someone unsure what an import
    // does — caught by running the real flow, not by a unit test.
    it('points at the migration docs while an import is pending', async () => {
      __setStateForTests('PENDING_IMPORT', SOURCE)

      const res = await request(await testApp()).get('/api/v1/system/db-status')

      expect(res.body.docsUrl).toMatch(/#migrating-from-sqlite-to-postgres$/)
    })
  })

  describe('POST /api/v1/system/import-from-sqlite', () => {
    it('409s when no import is pending', async () => {
      const res = await request(await testApp()).post('/api/v1/system/import-from-sqlite')

      expect(res.status).toBe(409)
      expect(res.body).toEqual({ error: 'No import is pending.' })
    })

    it('explains a failed import, and says nothing was changed', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      __setStateForTests('PENDING_IMPORT', SOURCE)

      // No legacy database exists here, so the importer fails for a real reason.
      const res = await request(await testApp()).post('/api/v1/system/import-from-sqlite')

      expect(res.status).toBe(500)
      expect(res.body.error).toMatch(/^The import failed, so nothing was changed — /)
      // Still pending: a failure must leave the user able to try again.
      expect(getState()).toBe('PENDING_IMPORT')
    })

    it('records the failure in the log as well as the response', async () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
      __setStateForTests('PENDING_IMPORT', SOURCE)

      await request(await testApp()).post('/api/v1/system/import-from-sqlite')

      expect(logged).toHaveBeenCalledWith('Import from SQLite failed. Nothing was changed.')
    })
  })

  // Drizzle stringifies the entire failed statement and every bound parameter
  // into its message. During an import those parameters are the user's own rows,
  // so echoing it put player names and session notes on screen in place of an
  // explanation. Found by running a failing import, not by a unit test.
  describe('describeImportFailure', () => {
    it('uses the driver error underneath, not the query dump', () => {
      const driverError = new Error('column "played_at" of relation "sessions" does not exist')
      const drizzleError = new Error('Failed query: insert into "sessions" ... params: 1,2026-07-21,Ada beat everyone', { cause: driverError })

      const message = describeImportFailure(drizzleError)

      expect(message).toBe('The import failed, so nothing was changed — column "played_at" of relation "sessions" does not exist')
      expect(message).not.toMatch(/Failed query|params:|Ada beat everyone/)
    })

    it('falls back to the error itself when there is nothing underneath', () => {
      expect(describeImportFailure(new Error('ENOENT: no such file or directory'))).toMatch(/— ENOENT: no such file or directory$/)
    })

    it('handles a thrown non-Error', () => {
      expect(describeImportFailure('something odd')).toMatch(/— something odd$/)
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
