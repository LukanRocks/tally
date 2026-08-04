import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { createServer } from 'net'
import { mkdtempSync, rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { Client } from 'pg'

/**
 * Boots the real server, the way a user's container does.
 *
 * Everything here drives built artifacts — `backend/dist/main.js`, not `src` —
 * against a real Postgres over real HTTP. Nothing is mocked, because every
 * defect this suite exists to catch lived at a seam a mock would have
 * reproduced rather than exercised: the migration runner, driver type coercion,
 * the WAL, the build itself.
 */

export const REPO_ROOT = resolve(__dirname, '..', '..')
export const BACKEND_DIR = join(REPO_ROOT, 'backend')
export const SERVER_ENTRY = join(BACKEND_DIR, 'dist', 'main.js')

/** Matches docker-compose.test.yml, so local and CI runs are identical. */
const PG_HOST = process.env.E2E_PG_HOST ?? 'localhost'
const PG_PORT = process.env.E2E_PG_PORT ?? '55432'
const PG_USER = process.env.E2E_PG_USER ?? 'tally'
const PG_PASSWORD = process.env.E2E_PG_PASSWORD ?? 'tally'
const PG_ADMIN_DB = process.env.E2E_PG_DB ?? 'tally_test'

export const pgUrl = (database: string): string => `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${database}`

/**
 * Fails with instructions rather than a confusing runtime error.
 *
 * `dist` going stale is not hypothetical: a previous phase shipped a broken
 * build because `tsc` failed while an older `dist` sat there looking healthy.
 */
export function assertBuilt(): void {
  if (!existsSync(SERVER_ENTRY)) {
    throw new Error(`No build found at ${SERVER_ENTRY}.\n\nThese tests run the built server, not the sources. Run:\n\n  pnpm -C backend build\n`)
  }
}

export async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const probe = createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, () => {
      const { port } = probe.address() as { port: number }
      probe.close(() => resolvePort(port))
    })
  })
}

export function tempDataDir(label: string): string {
  return mkdtempSync(join(tmpdir(), `tally-e2e-${label}-`))
}

export function removeDataDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

async function withAdminClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: pgUrl(PG_ADMIN_DB) })

  try {
    await client.connect()
    return await fn(client)
  } catch (err) {
    if (err instanceof Error && /ECONNREFUSED/.test(err.message)) {
      throw new Error(`Cannot reach Postgres at ${PG_HOST}:${PG_PORT}.\n\nStart it with:\n\n  docker compose -f docker-compose.test.yml up -d --wait\n`)
    }
    throw err
  } finally {
    await client.end().catch(() => {})
  }
}

/** A database per scenario, so one failure cannot contaminate the next. */
export async function createDatabase(name: string): Promise<string> {
  await withAdminClient(async (client) => {
    await client.query(`DROP DATABASE IF EXISTS ${name}`)
    await client.query(`CREATE DATABASE ${name}`)
  })

  return pgUrl(name)
}

export async function dropDatabase(name: string): Promise<void> {
  await withAdminClient(async (client) => {
    await client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`)
  })
}

export async function queryDatabase<T = Record<string, unknown>>(name: string, sql: string): Promise<T[]> {
  const client = new Client({ connectionString: pgUrl(name) })

  try {
    await client.connect()
    const { rows } = await client.query(sql)
    return rows as T[]
  } finally {
    await client.end().catch(() => {})
  }
}

export interface ServerHandle {
  port: number
  /** Absolute URL for a path under /api/v1. */
  api: (path: string) => string
  get: <T = unknown>(path: string) => Promise<{ status: number; body: T }>
  post: <T = unknown>(path: string, payload?: unknown) => Promise<{ status: number; body: T }>
  /** Everything the process has written to stdout and stderr so far. */
  output: () => string
  exitCode: () => number | null
  stop: () => Promise<void>
}

export interface StartOptions {
  dataDir: string
  env?: Record<string, string | undefined>
  /**
   * Set when the server is expected to fail rather than serve — a config error
   * or a crash. Readiness then means "it stopped starting", not "it answers".
   */
  expectDegradedOrExit?: boolean
}

/**
 * Starts the built server and resolves once it is answering, or once it has
 * given up. Rejects with the process output on anything else, because a boot
 * failure with no explanation is the hardest kind of e2e failure to debug.
 */
export async function startServer({ dataDir, env = {}, expectDegradedOrExit = false }: StartOptions): Promise<ServerHandle> {
  assertBuilt()

  const port = await freePort()
  let output = ''
  let exited: number | null = null

  const child: ChildProcessWithoutNullStreams = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      // Cleared so a developer's own .env or shell cannot reach into a scenario.
      DATABASE_URL: undefined,
      DB_HOST: undefined,
      DB_PORT: undefined,
      DB_NAME: undefined,
      DB_USER: undefined,
      DB_PASSWORD: undefined,
      DB_SSL: undefined,
      NODE_ENV: undefined,
      PORT: String(port),
      DATA_DIR: dataDir,
      ...env,
    } as NodeJS.ProcessEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (chunk) => (output += chunk.toString()))
  child.stderr.on('data', (chunk) => (output += chunk.toString()))
  child.on('exit', (code) => (exited = code ?? 0))

  const url = (path: string) => `http://127.0.0.1:${port}${path.startsWith('/') ? path : `/${path}`}`

  const request = async <T>(path: string, init?: RequestInit): Promise<{ status: number; body: T }> => {
    const response = await fetch(url(path), init)
    const text = await response.text()

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }

    return { status: response.status, body: body as T }
  }

  const handle: ServerHandle = {
    port,
    api: (path) => url(path),
    get: (path) => request(path),
    post: (path, payload) => request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload ?? {}) }),
    output: () => output,
    exitCode: () => exited,
    stop: async () => {
      if (exited !== null) return

      child.kill('SIGTERM')
      await new Promise<void>((done) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL')
          done()
        }, 5_000)

        child.on('exit', () => {
          clearTimeout(timer)
          done()
        })
      })
    },
  }

  await waitUntilSettled(handle, () => exited, expectDegradedOrExit)

  return handle
}

/**
 * A healthy boot answers db-status. A refused configuration still answers it,
 * from the degraded server. A crash never will. Waiting on any of those three
 * rather than a fixed sleep is what keeps this suite from being flaky.
 */
async function waitUntilSettled(handle: ServerHandle, exitCode: () => number | null, expectDegradedOrExit: boolean): Promise<void> {
  const deadline = Date.now() + 40_000

  while (Date.now() < deadline) {
    if (exitCode() !== null) {
      if (expectDegradedOrExit) return
      throw new Error(`Server exited during startup with code ${exitCode()}.\n\n${handle.output()}`)
    }

    try {
      const { status } = await handle.get('/api/v1/system/db-status')
      if (status === 200) return
    } catch {
      // Not listening yet.
    }

    await new Promise((done) => setTimeout(done, 150))
  }

  await handle.stop()
  throw new Error(`Server never became ready within 40s.\n\n${handle.output()}`)
}

/** Seeds a running install through its own API, so setup exercises the real routes. */
export async function seed(server: ServerHandle): Promise<{ players: number[]; games: number[] }> {
  const players: number[] = []
  const games: number[] = []

  for (const name of ['Ada', 'Bob', 'Cleo', 'Dev']) {
    const { body } = await server.post<{ id: number }>('/api/v1/players', { name })
    players.push(body.id)
  }

  for (const name of ['Catan', 'Wingspan', 'Azul']) {
    const { body } = await server.post<{ id: number }>('/api/v1/games', { name, min_players: 2, max_players: 4 })
    games.push(body.id)
  }

  for (let i = 0; i < 5; i += 1) {
    await server.post('/api/v1/sessions', {
      game_id: games[i % games.length],
      played_at: `2026-07-2${i + 1}`,
      results: [
        { player_id: players[0], rank: 1 },
        { player_id: players[1], rank: 2 },
        { player_id: players[2], rank: 3 },
      ],
    })
  }

  return { players, games }
}
