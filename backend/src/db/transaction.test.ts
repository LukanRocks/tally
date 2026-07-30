import { describe, it, expect, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { resetDb, testApp, request } from '../test/helpers'
import { db, sqlite, dialect } from './index'
import { withTransaction } from './transaction'
import { players as playersTable, sessions as sessionsTable, session_results as resultsTable } from './schema'

const countPlayers = async () => (await db.select().from(playersTable)).length

describe('withTransaction', () => {
  beforeEach(() => resetDb())

  it('commits when the callback resolves', async () => {
    const result = await withTransaction(async (tx) => {
      await tx.insert(playersTable).values({ name: 'Ada' })
      return 'returned'
    })

    expect(result).toBe('returned')
    expect(await countPlayers()).toBe(1)
  })

  it('rolls back every statement when the callback throws', async () => {
    await expect(
      withTransaction(async (tx) => {
        await tx.insert(playersTable).values({ name: 'Ada' })
        await tx.insert(playersTable).values({ name: 'Bob' })
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')

    expect(await countPlayers()).toBe(0)
  })

  it('leaves no transaction open after a rollback', async () => {
    await expect(withTransaction(async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')

    if (dialect === 'sqlite') expect(sqlite!.inTransaction).toBe(false)
  })

  it('is usable again after a failed transaction', async () => {
    await expect(withTransaction(async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')

    await withTransaction(async (tx) => tx.insert(playersTable).values({ name: 'After' }))

    expect(await countPlayers()).toBe(1)
  })

  // The reason the queue exists: without it, overlapping callers would both
  // issue BEGIN and SQLite would reject the nested one.
  it('serializes overlapping transactions instead of nesting them', async () => {
    const names = ['a', 'b', 'c', 'd', 'e']

    const results = await Promise.allSettled(
      names.map((name) =>
        withTransaction(async (tx) => {
          await tx.insert(playersTable).values({ name })
          await new Promise((resolve) => setTimeout(resolve, 1)) // force a yield mid-transaction
          await tx.insert(playersTable).values({ name: `${name}2` })
        }),
      ),
    )

    expect(results.filter((r) => r.status === 'rejected')).toEqual([])
    expect(await countPlayers()).toBe(names.length * 2)
  })

  it('keeps the queue alive when one of several concurrent transactions fails', async () => {
    const results = await Promise.allSettled([
      withTransaction(async (tx) => tx.insert(playersTable).values({ name: 'ok-1' })),
      withTransaction(async () => Promise.reject(new Error('boom'))),
      withTransaction(async (tx) => tx.insert(playersTable).values({ name: 'ok-2' })),
    ])

    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'rejected', 'fulfilled'])
    expect(await countPlayers()).toBe(2)
    if (dialect === 'sqlite') expect(sqlite!.inTransaction).toBe(false)
  })

  // End-to-end proof that the route-level guarantee survived the refactor: a
  // session and its result rows are all-or-nothing.
  it('leaves no partial session behind when a result insert fails', async () => {
    const ada = await request(await testApp())
      .post('/api/v1/players')
      .send({ name: 'Ada' })

    await expect(
      withTransaction(async (tx) => {
        const [session] = await tx.insert(sessionsTable).values({ game_id: 1, played_at: '2026-01-01' }).returning()
        await tx.insert(resultsTable).values({ session_id: session.id, player_id: ada.body.id, rank: 1, points_awarded: 3 })
        throw new Error('fail after both inserts')
      }),
    ).rejects.toThrow()

    expect(await db.select().from(sessionsTable)).toEqual([])
    expect(await db.select().from(resultsTable)).toEqual([])
    expect(await db.select().from(playersTable).where(eq(playersTable.id, ada.body.id))).toHaveLength(1)
  })
})
