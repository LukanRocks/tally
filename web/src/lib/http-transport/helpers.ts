const BASE_API_ENDPOINT = '/api/v1'

/** Shape the backend attaches to a failure the operator can act on. */
export type HttpError = Error & {
  code?: number
  /** Set when the server is up but cannot serve data — see backend db/state-types.ts. */
  state?: 'READY' | 'PENDING_IMPORT' | 'MISCONFIGURED'
  problem?: string
  /** Documentation section explaining this specific problem. */
  docsUrl?: string
}

export const stripNulls = <T>(payload: unknown): T => {
  if (payload === null) return undefined as T
  if (Array.isArray(payload)) return payload.map(stripNulls) as T
  if (typeof payload === 'object') {
    return Object.fromEntries(Object.entries(payload as Record<string, unknown>).map(([key, value]) => [key, stripNulls(value)])) as T
  }

  return payload as T
}

export const request = (method: string, payload: unknown, overrides?: RequestInit): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  ...overrides,
})

export const perform = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_API_ENDPOINT}${endpoint}`, options)

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))

    // The backend uses two shapes: `error` for ordinary failures, and a
    // `problem` + `docsUrl` pair for states the operator has to resolve (a
    // misconfigured database, a pending migration). Reading only `error` meant
    // those arrived as a bare "Request failed" while the real explanation sat
    // unread in the body.
    const error = new Error(body.error ?? body.problem ?? 'Request failed') as HttpError

    error.code = response.status
    error.state = body.state
    error.problem = body.problem
    error.docsUrl = body.docsUrl

    throw error
  }

  if (response.status === 204) return undefined as T // 204 No Content

  return response.json().then(stripNulls<T>)
}
