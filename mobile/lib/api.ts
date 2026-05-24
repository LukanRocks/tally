import { getServerUrl } from './storage'
import type { Game, Player, Session, LeaderboardEntry, SessionCreatePayload } from './types'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getServerUrl()!
  const res = await fetch(`${base}/api/v1${path}`, options)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

function json(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const api = {
  health: {
    check: () => {
      const base = getServerUrl()!

      return fetch(`${base}/api/health`).then((r) => {
        if (!r.ok) throw new Error('Server did not respond')
      })
    },
  },

  games: {
    list: (search?: string) => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      return req<Game[]>(`/games${qs}`)
    },
    get: (id: number) => req<Game>(`/games/${id}`),
  },

  players: {
    list: () => req<Player[]>('/players'),
    get: (id: number) => req<Player>(`/players/${id}`),
  },

  sessions: {
    list: () => req<Session[]>('/sessions'),
    create: (payload: SessionCreatePayload) => req<Session>('/sessions', json('POST', payload)),
  },

  stats: {
    leaderboard: () => req<LeaderboardEntry[]>('/stats/leaderboard'),
  },
}
