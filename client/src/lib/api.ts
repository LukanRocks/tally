const BASE = '/api/v1'

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

function json(method: string, body: unknown, extra?: RequestInit): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...extra,
  }
}

// --- Types ---

export interface Game {
  id: number
  name: string
  description: string | null
  quick_rules: string | null
  min_players: number | null
  max_players: number | null
  purchase_at: string | null
  price: number | null
  cover_image_path: string | null
  owner_id: number | null
  owner_name: string | null
  created_at: string
  session_count?: number
  attachments?: GameAttachment[]
}

export interface Settings {
  id: 1
  onboarded: 0 | 1
  currency: 'USD' | 'BRL'
  language: 'en' | 'pt'
  default_owner_id: number | null
  theme: 'light' | 'dark' | 'system'
  updated_at: string
}

export interface GameAttachment {
  id: number
  game_id: number
  label: string
  file_path: string
  created_at: string
}

export interface Player {
  id: number
  name: string
  avatar_path: string | null
  created_at: string
  total_points?: number
  total_sessions?: number
  wins?: number
  win_rate?: number
}

export interface Session {
  id: number
  game_id: number
  game_name?: string
  played_at: string
  notes: string | null
  created_at: string
  player_count?: number
  results?: SessionResult[]
}

export interface SessionResult {
  id: number
  player_id: number
  player_name: string
  rank: number
  points_awarded: number
}

export interface LeaderboardEntry {
  player_id: number
  player_name: string
  avatar_path: string | null
  total_points: number
  wins: number
  total_sessions: number
  win_rate: number
}

export interface MostPlayedGame {
  id: number
  name: string
  cover_image_path: string | null
  session_count: number
  unique_players: number
}

export interface HeadToHead {
  player1: { id: number; name: string; avatar_path: string | null }
  player2: { id: number; name: string; avatar_path: string | null }
  shared_sessions: number
  p1_wins: number
  p2_wins: number
  sessions: Array<{
    session_id: number
    played_at: string
    game_name: string
    p1_rank: number
    p1_points: number
    p2_rank: number
    p2_points: number
  }>
}

// --- API ---

export const api = {
  games: {
    list: (params?: { search?: string; sort?: string; order?: 'asc' | 'desc'; minPlayers?: number; maxPlayers?: number; ownerId?: number }) => {
      const qs = new URLSearchParams()
      if (params?.search) qs.set('search', params.search)
      if (params?.sort) qs.set('sort', params.sort)
      if (params?.order) qs.set('order', params.order)
      if (params?.minPlayers) qs.set('minPlayers', String(params.minPlayers))
      if (params?.maxPlayers) qs.set('maxPlayers', String(params.maxPlayers))
      if (params?.ownerId) qs.set('ownerId', String(params.ownerId))
      return req<Game[]>(`/games?${qs}`)
    },
    get: (id: number) => req<Game>(`/games/${id}`),
    create: (data: Omit<Game, 'id' | 'created_at' | 'session_count' | 'attachments'>) => req<Game>('/games', json('POST', data)),
    update: (id: number, data: Partial<Omit<Game, 'id' | 'created_at'>>) => req<Game>(`/games/${id}`, json('PUT', data)),
    delete: (id: number) => req<void>(`/games/${id}`, { method: 'DELETE' }),
    uploadCover: (id: number, file: File) => {
      const fd = new FormData()
      fd.append('cover', file)
      return req<Game>(`/games/${id}/cover`, { method: 'POST', body: fd })
    },
    uploadAttachment: (id: number, file: File, label: string) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('label', label)
      return req<GameAttachment>(`/games/${id}/attachments`, { method: 'POST', body: fd })
    },
    deleteAttachment: (id: number, aid: number) => req<void>(`/games/${id}/attachments/${aid}`, { method: 'DELETE' }),
  },

  players: {
    list: () => req<Player[]>('/players'),
    get: (id: number) => req<Player>(`/players/${id}`),
    create: (name: string) => req<Player>('/players', json('POST', { name })),
    update: (id: number, name: string) => req<Player>(`/players/${id}`, json('PUT', { name })),
    delete: (id: number) => req<void>(`/players/${id}`, { method: 'DELETE' }),
    uploadAvatar: (id: number, file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return req<Player>(`/players/${id}/avatar`, { method: 'POST', body: fd })
    },
  },

  sessions: {
    list: () => req<Session[]>('/sessions'),
    get: (id: number) => req<Session>(`/sessions/${id}`),
    create: (data: { game_id: number; played_at: string; notes?: string; results: Array<{ player_id: number; rank: number }> }) => req<Session>('/sessions', json('POST', data)),
    delete: (id: number) => req<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  stats: {
    leaderboard: () => req<LeaderboardEntry[]>('/stats/leaderboard'),
    leaderboardByGame: (gameId: number) => req<LeaderboardEntry[]>(`/stats/leaderboard/game/${gameId}`),
    mostPlayed: () => req<MostPlayedGame[]>('/stats/most-played'),
    headToHead: (player1: number, player2: number) => req<HeadToHead>(`/stats/head-to-head?player1=${player1}&player2=${player2}`),
  },

  settings: {
    get: () => req<Settings>('/settings'),
    update: (data: Partial<Omit<Settings, 'id' | 'updated_at'>>) => req<Settings>('/settings', json('PUT', data)),
    reset: () => req<void>('/settings/reset', { method: 'DELETE' }),
  },
}
