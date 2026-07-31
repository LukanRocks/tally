import { join } from 'path'
import type { HelpAnchor } from '../help-links'

export type Dialect = 'sqlite' | 'postgres'

export type DatabaseConfig = { dialect: 'sqlite'; file: string } | { dialect: 'postgres'; connectionString: string; ssl: SslMode }

export const SSL_MODES = ['disable', 'require', 'verify-full'] as const
export type SslMode = (typeof SSL_MODES)[number]

/** Discrete vars that must all be present together, or not at all. */
const DISCRETE_REQUIRED = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const

/**
/**
 * States what is wrong and points at the documentation. Deliberately does not
 * carry remedial instructions: the problem text names the offending variables,
 * and anything longer belongs in the docs rather than duplicated across a
 * console banner, an API payload and a browser screen.
 */
export class DatabaseConfigError extends Error {
  readonly problem: string
  readonly note?: string
  /** Which documentation section explains this specific problem. */
  readonly docs: HelpAnchor

  constructor({ problem, note, docs = 'database' }: { problem: string; note?: string; docs?: HelpAnchor }) {
    super(problem)
    this.name = 'DatabaseConfigError'
    this.problem = problem
    this.note = note
    this.docs = docs
  }
}

function present(env: NodeJS.ProcessEnv, key: string): boolean {
  const value = env[key]
  return value !== undefined && value.trim() !== ''
}

/**
 * Resolves the database configuration from the environment.
 *
 * No database vars at all → SQLite, exactly as a default install behaves.
 * `DATABASE_URL`, or a *complete* discrete set → Postgres.
 *
 * Anything ambiguous throws. This is deliberate and is the single most
 * important rule in this file: a typo'd `DB_HOST` that silently fell back to
 * SQLite would let someone write into a fresh empty file while believing they
 * were on their Postgres server. Failing to boot is dramatically better than
 * splitting a user's data across two stores without telling them.
 */
export function resolveDatabaseConfig(env: NodeJS.ProcessEnv = process.env, dataDir?: string): DatabaseConfig {
  const hasUrl = present(env, 'DATABASE_URL')
  const discretePresent = DISCRETE_REQUIRED.filter((key) => present(env, key))

  if (hasUrl && discretePresent.length > 0) {
    throw new DatabaseConfigError({
      problem: `DATABASE_URL and the discrete database variables (${discretePresent.join(', ')}) are both set. Use one or the other, not both.`,
      note: 'Tally will not pick for you: guessing wrong would point it at the wrong database.',
    })
  }

  if (hasUrl) {
    return { dialect: 'postgres', connectionString: env.DATABASE_URL!.trim(), ssl: parseSslMode(env) }
  }

  if (discretePresent.length > 0) {
    const missing = DISCRETE_REQUIRED.filter((key) => !present(env, key))

    if (missing.length > 0) {
      throw new DatabaseConfigError({
        problem: `Postgres is only partly configured — ${discretePresent.join(', ')} ${discretePresent.length === 1 ? 'is' : 'are'} set, but ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} missing.`,
        note: 'Tally will not fall back to SQLite here: it would silently write to a different database than you configured.',
      })
    }

    const port = env.DB_PORT?.trim() || '5432'

    if (!/^\d+$/.test(port)) {
      throw new DatabaseConfigError({
        problem: `DB_PORT is "${port}", which is not a number.`,
      })
    }

    const user = encodeURIComponent(env.DB_USER!.trim())
    const password = encodeURIComponent(env.DB_PASSWORD!)
    const host = env.DB_HOST!.trim()
    const name = env.DB_NAME!.trim()

    return { dialect: 'postgres', connectionString: `postgres://${user}:${password}@${host}:${port}/${name}`, ssl: parseSslMode(env) }
  }

  const dir = dataDir ?? env.DATA_DIR ?? join(process.cwd(), 'data')

  return { dialect: 'sqlite', file: join(dir, 'tally.db') }
}

function parseSslMode(env: NodeJS.ProcessEnv): SslMode {
  const raw = env.DB_SSL?.trim()

  if (!raw) return 'disable'
  if ((SSL_MODES as readonly string[]).includes(raw)) return raw as SslMode

  throw new DatabaseConfigError({
    // The valid values define the error rather than remedy it, so they belong here.
    problem: `DB_SSL is "${raw}". Valid modes are: ${SSL_MODES.join(', ')}.`,
    docs: 'ssl',
  })
}

/**
 * A description safe to log. Postgres credentials never appear in output —
 * a self-hosted app's logs end up in pastebins and GitHub issues.
 */
export function describeConfig(config: DatabaseConfig): string {
  if (config.dialect === 'sqlite') return `sqlite (${config.file})`

  return `postgres (${redactConnectionString(config.connectionString)}, ssl=${config.ssl})`
}

export function redactConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString)
    if (url.password) url.password = '***'
    return url.toString()
  } catch {
    // Unparseable strings are handed to the driver as-is; never echo one back,
    // since we cannot know which part of it is the password.
    return '<connection string>'
  }
}
