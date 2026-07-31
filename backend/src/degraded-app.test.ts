import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createDegradedApp } from './degraded-app'
import { DatabaseConfigError, resolveDatabaseConfig } from './db/config'

/** The real error a partial compose config produces, not a hand-built stub. */
function realConfigError(): DatabaseConfigError {
  try {
    resolveDatabaseConfig({ DB_HOST: 'pg.local' } as NodeJS.ProcessEnv, '/data')
  } catch (err) {
    if (err instanceof DatabaseConfigError) return err
    throw err
  }
  throw new Error('expected a DatabaseConfigError')
}

describe('degraded app', () => {
  const app = () => createDegradedApp(realConfigError())

  it('answers db-status with 200 so the frontend can render the explanation', async () => {
    const res = await request(app()).get('/api/v1/system/db-status')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      state: 'MISCONFIGURED',
      problem: expect.stringContaining('DB_NAME, DB_USER, DB_PASSWORD'),
      docsUrl: expect.stringContaining('#database-configuration'),
    })
  })

  // A bad DB_SSL value should link to the SSL section, not the general one —
  // the link is only useful if it lands where the answer is.
  it('links to the section matching the specific problem', async () => {
    let err: DatabaseConfigError
    try {
      resolveDatabaseConfig({ DATABASE_URL: 'postgres://u:p@h/db', DB_SSL: 'requrie' } as NodeJS.ProcessEnv, '/data')
      throw new Error('expected throw')
    } catch (e) {
      err = e as DatabaseConfigError
    }

    const res = await request(createDegradedApp(err)).get('/api/v1/system/db-status')

    expect(res.body.docsUrl).toMatch(/#database-ssl$/)
  })

  it.each([
    ['GET', '/api/v1/games'],
    ['GET', '/api/v1/players'],
    ['GET', '/api/v1/stats/leaderboard'],
    ['GET', '/api/v1/settings'],
  ])('503s %s %s with the same explanation', async (_method, path) => {
    const res = await request(app()).get(path)

    expect(res.status).toBe(503)
    expect(res.body).toMatchObject({ state: 'MISCONFIGURED', problem: expect.any(String), docsUrl: expect.any(String) })
  })

  it('503s writes too', async () => {
    const res = await request(app()).post('/api/v1/players').send({ name: 'Nope' })

    expect(res.status).toBe(503)
  })

  // The whole point of staying up: the user gets an explanation in the browser
  // rather than a log they have not opened.
  // The contract is deliberately narrow: state the problem, link to the docs.
  it('carries a problem and somewhere to learn more, and nothing else', async () => {
    const { body } = await request(app()).get('/api/v1/system/db-status')

    expect(body).not.toHaveProperty('fix')
    // `note` explains why Tally refuses; that reasoning stays in the console,
    // whose audience is already reading logs.
    expect(body).not.toHaveProperty('note')
    expect(body.problem).toEqual(expect.any(String))
    expect(body.docsUrl).toMatch(/^https:\/\/github\.com\/LukanRocks\/tally#/)
  })

  it('never leaks a password', async () => {
    let err: DatabaseConfigError
    try {
      resolveDatabaseConfig({ DATABASE_URL: 'postgres://u:hunter2@h/db', DB_HOST: 'x', DB_PASSWORD: 'hunter2' } as NodeJS.ProcessEnv, '/data')
      throw new Error('expected throw')
    } catch (e) {
      err = e as DatabaseConfigError
    }

    const res = await request(createDegradedApp(err)).get('/api/v1/system/db-status')

    expect(JSON.stringify(res.body)).not.toMatch(/hunter2/)
  })
})
