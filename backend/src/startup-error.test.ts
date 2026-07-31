import { describe, it, expect } from 'vitest'
import { formatStartupError, explainStartupError } from './startup-error'
import { resolveDatabaseConfig } from './db/config'

const resolve = (env: Record<string, string | undefined>) => resolveDatabaseConfig(env as NodeJS.ProcessEnv, '/data')
const caught = (env: Record<string, string | undefined>): unknown => {
  try {
    resolve(env)
    throw new Error('expected a config error')
  } catch (err) {
    return err
  }
}

const pgError = (code: string, message = '', extra: Record<string, unknown> = {}) => Object.assign(new Error(message), { code }, extra)

describe('formatStartupError', () => {
  // The operator is reading `docker logs` after editing a compose file. Every
  // known failure must say what is wrong and what to change — never a bare
  // stack trace.
  it.each([
    ['partial discrete config', { DB_HOST: 'pg.local' }, /DB_HOST is set, but DB_NAME, DB_USER, DB_PASSWORD are missing/],
    ['single missing var uses singular grammar', { DB_HOST: 'h', DB_NAME: 'n', DB_USER: 'u' }, /DB_PASSWORD is missing/],
    ['conflicting config', { DATABASE_URL: 'postgres://u:p@h/db', DB_HOST: 'other' }, /both set. Use one or the other/],
    ['bad DB_SSL', { DATABASE_URL: 'postgres://u:p@h/db', DB_SSL: 'requrie' }, /DB_SSL is "requrie". Valid modes are: disable, require, verify-full/],
    ['bad DB_PORT', { DB_HOST: 'h', DB_NAME: 'n', DB_USER: 'u', DB_PASSWORD: 'p', DB_PORT: '54r32' }, /DB_PORT is "54r32", which is not a number/],
  ])('explains %s', (_label, env, problemPattern) => {
    const output = formatStartupError(caught(env))

    expect(output).toMatch(/Tally could not start/)
    expect(output).toMatch(problemPattern)
    // Every explained failure points somewhere to learn more.
    expect(output).toMatch(/Reference: https:\/\/github\.com\/LukanRocks\/tally#/)
    expect(output).not.toMatch(/node:internal/)
    expect(output).not.toMatch(/ {4}at /)
  })

  it.each([
    ['ENOTFOUND', pgError('ENOTFOUND', 'getaddrinfo ENOTFOUND pg.local'), /host could not be found \(pg\.local\)/],
    ['ECONNREFUSED', pgError('ECONNREFUSED', 'connect ECONNREFUSED', { address: '10.0.0.5', port: 5432 }), /refused the connection at 10\.0\.0\.5:5432/],
    ['ETIMEDOUT', pgError('ETIMEDOUT'), /timed out/],
    ['bad password', pgError('28P01', 'password authentication failed'), /rejected the username or password/],
    ['missing database', pgError('3D000', 'database "tally" does not exist'), /does not exist/],
    ['TLS', pgError('SELF_SIGNED_CERT_IN_CHAIN'), /certificate could not be verified/],
  ])('explains a %s connection failure', (_label, err, problemPattern) => {
    const output = formatStartupError(err)

    expect(output).toMatch(problemPattern)
    expect(output).toMatch(/Reference: https:/)
    expect(output).not.toMatch(/ {4}at /)
  })

  // Swallowing an unrecognised failure would trade one bad experience for a
  // worse one — a silent exit with nothing to debug.
  it('falls back to the full stack for an unrecognised error', () => {
    const output = formatStartupError(new Error('something genuinely unexpected'))

    expect(output).toMatch(/something genuinely unexpected/)
    expect(output).toMatch(/ {4}at /)
  })

  it('handles a thrown non-Error', () => {
    expect(formatStartupError('just a string')).toMatch(/just a string/)
  })

  it('never leaks a password into the output', () => {
    const output = formatStartupError(caught({ DATABASE_URL: 'postgres://tally:hunter2@h/db', DB_HOST: 'other', DB_PASSWORD: 'hunter2' }))

    expect(output).not.toMatch(/hunter2/)
  })

  it('returns null for errors it cannot explain', () => {
    expect(explainStartupError(new Error('nope'))).toBeNull()
  })
})
