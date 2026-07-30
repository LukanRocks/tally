import { describe, it, expect, beforeEach } from 'vitest'
import { request, testApp, resetDb } from '../test/helpers'

const CSV = ['id,name,yearpublished', '13,Catan,1995', '9209,Ticket to Ride,2004', '822,Carcassonne,2000'].join('\n')

function importCsv(body: string, filename = 'collection.csv') {
  return request(testApp()).post('/api/v1/bgg/import').attach('file', Buffer.from(body), { filename, contentType: 'text/csv' })
}

describe('bgg', () => {
  beforeEach(() => resetDb())

  describe('POST /api/v1/bgg/import', () => {
    it('imports valid rows and stamps bgg_last_updated', async () => {
      const res = await importCsv(CSV)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ imported: 3 })

      const settings = await request(testApp()).get('/api/v1/settings')
      expect(settings.body.bgg_last_updated).toEqual(expect.any(String))
    })

    it('accepts objectid as an alias for id', async () => {
      const res = await importCsv(['objectid,name,yearpublished', '13,Catan,1995'].join('\n'))

      expect(res.body).toEqual({ imported: 1 })
      expect((await request(testApp()).get('/api/v1/bgg/search?q=catan')).body).toHaveLength(1)
    })

    it('skips rows with no name or a non-numeric id', async () => {
      const res = await importCsv(['id,name,yearpublished', '13,Catan,1995', 'notanumber,Broken,2000', '99,,2001'].join('\n'))

      expect(res.body).toEqual({ imported: 1 })
    })

    it('nulls an unparseable year', async () => {
      await importCsv(['id,name,yearpublished', '13,Catan,unknown'].join('\n'))

      const res = await request(testApp()).get('/api/v1/bgg/search?q=catan')
      expect(res.body[0]).toEqual({ bgg_id: 13, name: 'Catan', year_published: null })
    })

    it('replaces the previous import rather than appending', async () => {
      await importCsv(CSV)
      await importCsv(['id,name,yearpublished', '1,Only Game,2020'].join('\n'))

      expect((await request(testApp()).get('/api/v1/bgg/search?q=catan')).body).toEqual([])
      expect((await request(testApp()).get('/api/v1/bgg/search?q=only')).body).toHaveLength(1)
    })

    it('rejects a request with no file', async () => {
      const res = await request(testApp()).post('/api/v1/bgg/import')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'No file uploaded' })
    })

    // Imports are chunked multi-row inserts, so exercise well past one chunk —
    // a real BGG export is orders of magnitude larger than this.
    it('imports far more rows than fit in a single insert', async () => {
      const rows = Array.from({ length: 1000 }, (_, i) => `${1000 + i},Bulk Game ${i},2000`)

      const res = await importCsv(['id,name,yearpublished', ...rows].join('\n'))

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ imported: 1000 })
      expect((await request(testApp()).get('/api/v1/bgg/search?q=Bulk Game 999')).body).toEqual([{ bgg_id: 1999, name: 'Bulk Game 999', year_published: 2000 }])
    })
  })

  describe('GET /api/v1/bgg/search', () => {
    beforeEach(async () => {
      await importCsv(CSV)
    })

    it('finds games by partial name', async () => {
      const res = await request(testApp()).get('/api/v1/bgg/search?q=ticket')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([{ bgg_id: 9209, name: 'Ticket to Ride', year_published: 2004 }])
    })

    // Same SQLite-vs-Postgres LIKE trap as game search — see games.test.ts.
    it('matches case-insensitively', async () => {
      expect((await request(testApp()).get('/api/v1/bgg/search?q=CATAN')).body).toHaveLength(1)
      expect((await request(testApp()).get('/api/v1/bgg/search?q=catan')).body).toHaveLength(1)
    })

    it.each([['a'], ['']])('returns an empty list for a query shorter than 2 chars: %j', async (q) => {
      const res = await request(testApp()).get(`/api/v1/bgg/search?q=${q}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('caps results at 10', async () => {
      const rows = Array.from({ length: 15 }, (_, i) => `${100 + i},Game Number ${i},2000`)
      await importCsv(['id,name,yearpublished', ...rows].join('\n'))

      const res = await request(testApp()).get('/api/v1/bgg/search?q=game')

      expect(res.body).toHaveLength(10)
    })
  })

  describe('DELETE /api/v1/bgg', () => {
    it('clears the imported data and the timestamp', async () => {
      await importCsv(CSV)

      const res = await request(testApp()).delete('/api/v1/bgg')
      expect(res.status).toBe(204)

      expect((await request(testApp()).get('/api/v1/bgg/search?q=catan')).body).toEqual([])
      expect((await request(testApp()).get('/api/v1/settings')).body.bgg_last_updated).toBeNull()
    })

    it('is a no-op when nothing was imported', async () => {
      expect((await request(testApp()).delete('/api/v1/bgg')).status).toBe(204)
    })
  })
})
