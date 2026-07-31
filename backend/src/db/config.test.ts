import { describe, it, expect } from 'vitest'
import { resolveDatabaseConfig, describeConfig, redactConnectionString, DatabaseConfigError } from './config'

const resolve = (env: Record<string, string | undefined>) => resolveDatabaseConfig(env as NodeJS.ProcessEnv, '/data')

const FULL_DISCRETE = { DB_HOST: 'pg.local', DB_NAME: 'tally', DB_USER: 'tally', DB_PASSWORD: 'secret' }

/** Resolves and returns the thrown config error, for asserting on its fields. */
function configError(env: Record<string, string | undefined>): DatabaseConfigError {
  try {
    resolve(env)
  } catch (err) {
    if (err instanceof DatabaseConfigError) return err
    throw err
  }
  throw new Error('expected a DatabaseConfigError')
}

describe('resolveDatabaseConfig', () => {
  describe('sqlite (the default path)', () => {
    it('falls back to SQLite when nothing is configured', () => {
      expect(resolve({})).toEqual({ dialect: 'sqlite', file: '/data/tally.db' })
    })

    it('honours DATA_DIR', () => {
      expect(resolveDatabaseConfig({ DATA_DIR: '/custom' } as NodeJS.ProcessEnv)).toEqual({ dialect: 'sqlite', file: '/custom/tally.db' })
    })

    it('ignores blank database variables rather than treating them as set', () => {
      expect(resolve({ DATABASE_URL: '   ', DB_HOST: '' })).toEqual({ dialect: 'sqlite', file: '/data/tally.db' })
    })
  })

  describe('postgres via DATABASE_URL', () => {
    it('resolves and defaults SSL to disable', () => {
      expect(resolve({ DATABASE_URL: 'postgres://u:p@host:5432/db' })).toEqual({
        dialect: 'postgres',
        connectionString: 'postgres://u:p@host:5432/db',
        ssl: 'disable',
      })
    })

    it.each(['disable', 'require', 'verify-full'])('accepts DB_SSL=%s', (mode) => {
      expect(resolve({ DATABASE_URL: 'postgres://u:p@h/db', DB_SSL: mode })).toMatchObject({ ssl: mode })
    })

    it('rejects an unknown DB_SSL value', () => {
      expect(() => resolve({ DATABASE_URL: 'postgres://u:p@h/db', DB_SSL: 'sorta' })).toThrow(DatabaseConfigError)
    })
  })

  describe('postgres via discrete variables', () => {
    it('builds a connection string from a complete set', () => {
      expect(resolve(FULL_DISCRETE)).toEqual({
        dialect: 'postgres',
        connectionString: 'postgres://tally:secret@pg.local:5432/tally',
        ssl: 'disable',
      })
    })

    it('honours DB_PORT', () => {
      expect(resolve({ ...FULL_DISCRETE, DB_PORT: '6543' })).toMatchObject({ connectionString: 'postgres://tally:secret@pg.local:6543/tally' })
    })

    it('percent-encodes credentials so punctuation cannot corrupt the URL', () => {
      expect(resolve({ ...FULL_DISCRETE, DB_PASSWORD: 'p@ss:w/rd?' })).toMatchObject({
        connectionString: 'postgres://tally:p%40ss%3Aw%2Frd%3F@pg.local:5432/tally',
      })
    })

    it('rejects a non-numeric DB_PORT', () => {
      expect(() => resolve({ ...FULL_DISCRETE, DB_PORT: 'fivefourthreetwo' })).toThrow(DatabaseConfigError)
      expect(configError({ ...FULL_DISCRETE, DB_PORT: 'fivefourthreetwo' }).problem).toContain('DB_PORT is "fivefourthreetwo"')
    })
  })

  // The single most important behavior in this file. A partial config that
  // silently fell back to SQLite would let someone write into an empty local
  // file while believing they were on their Postgres server.
  describe('refuses to guess', () => {
    it.each([
      ['only DB_HOST', { DB_HOST: 'pg.local' }],
      ['missing DB_PASSWORD', { DB_HOST: 'pg.local', DB_NAME: 'tally', DB_USER: 'tally' }],
      ['missing DB_NAME', { DB_HOST: 'pg.local', DB_USER: 'tally', DB_PASSWORD: 'secret' }],
    ])('throws on a partial discrete config: %s', (_label, env) => {
      expect(() => resolve(env)).toThrow(DatabaseConfigError)
    })

    it('names exactly what is missing, and what to do about it', () => {
      // Asserting on the structured fields rather than the prose: the wording
      // should be free to improve without breaking the test.
      expect(configError({ DB_HOST: 'pg.local' }).problem).toContain('DB_NAME, DB_USER, DB_PASSWORD')
    })

    it('never silently falls back to SQLite on a partial config', () => {
      expect(configError({ DB_HOST: 'pg.local' }).note).toMatch(/will not fall back to SQLite/)
    })

    it('throws when both DATABASE_URL and discrete variables are set', () => {
      expect(configError({ DATABASE_URL: 'postgres://u:p@h/db', ...FULL_DISCRETE }).problem).toContain('both set')
    })
  })
})

describe('redaction', () => {
  it('masks the password in a connection string', () => {
    expect(redactConnectionString('postgres://tally:hunter2@pg.local:5432/tally')).toBe('postgres://tally:***@pg.local:5432/tally')
  })

  it('does not echo back an unparseable connection string', () => {
    expect(redactConnectionString('not a url hunter2')).toBe('<connection string>')
  })

  it.each([
    ['discrete', FULL_DISCRETE],
    ['url', { DATABASE_URL: 'postgres://tally:hunter2@pg.local:5432/tally' }],
  ])('keeps the password out of describeConfig (%s)', (_label, env) => {
    const described = describeConfig(resolve(env))

    expect(described).not.toContain('hunter2')
    expect(described).not.toContain('secret')
    expect(described).toContain('***')
  })

  it('describes sqlite with its path', () => {
    expect(describeConfig(resolve({}))).toBe('sqlite (/data/tally.db)')
  })
})
