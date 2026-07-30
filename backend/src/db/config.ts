import { join } from 'path'

export type Dialect = 'sqlite' | 'postgres'

export type DatabaseConfig = { dialect: 'sqlite'; file: string } | { dialect: 'postgres'; connectionString: string; ssl: SslMode }

export const SSL_MODES = ['disable', 'require', 'verify-full'] as const
export type SslMode = (typeof SSL_MODES)[number]

/** Discrete vars that must all be present together, or not at all. */
const DISCRETE_REQUIRED = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseConfigError'
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
    throw new DatabaseConfigError(
      `Both DATABASE_URL and discrete database variables (${discretePresent.join(', ')}) are set. ` +
        `Pick one — precedence is deliberately not defined, because guessing wrong would point Tally at the wrong database.`,
    )
  }

  if (hasUrl) {
    return { dialect: 'postgres', connectionString: env.DATABASE_URL!.trim(), ssl: parseSslMode(env) }
  }

  if (discretePresent.length > 0) {
    const missing = DISCRETE_REQUIRED.filter((key) => !present(env, key))

    if (missing.length > 0) {
      throw new DatabaseConfigError(
        `Incomplete Postgres configuration. Set: ${missing.join(', ')} (or unset ${discretePresent.join(', ')} to use SQLite). ` +
          `Refusing to fall back to SQLite — that would silently write to a different database than you configured.`,
      )
    }

    const port = env.DB_PORT?.trim() || '5432'

    if (!/^\d+$/.test(port)) {
      throw new DatabaseConfigError(`DB_PORT must be a number, got "${port}".`)
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

  throw new DatabaseConfigError(`DB_SSL must be one of ${SSL_MODES.join(', ')}, got "${raw}".`)
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
