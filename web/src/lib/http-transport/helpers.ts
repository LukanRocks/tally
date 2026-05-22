const BASE_API_ENDPOINT = '/api/v1'

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

    throw new Error(body.error ?? 'Request failed')
  }

  if (response.status === 204) return undefined as T // 204 No Content

  return response.json().then(stripNulls<T>)
}
