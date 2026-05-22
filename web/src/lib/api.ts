const BASE = '/api/v1'

// --- Helpers ---

const buildJsonRequest = (method: string, payload: unknown, overrides?: RequestInit): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  ...overrides,
})

// #DOCS: T is the expected shape of the parsed response where null fields become undefined to match our interfaces
const stripNulls = <T>(payload: unknown): T => {
  if (payload === null) return undefined as T
  if (Array.isArray(payload)) return payload.map(stripNulls) as T
  if (typeof payload === 'object') {
    return Object.fromEntries(Object.entries(payload as Record<string, unknown>).map(([key, value]) => [key, stripNulls(value)])) as T
  }

  return payload as T
}

const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE}${endpoint}`, options)

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))

    throw new Error(body.error ?? 'Request failed')
  }

  if (response.status === 204) return undefined as T // 204 No Content

  return response.json().then(stripNulls<T>)
}

// --- Types ---

export interface Game {
  id: number
  name: string
  description?: string
  quick_rules?: string
  min_players?: number
  max_players?: number
  purchase_at?: string
  price?: number
  cover_image_path?: string
  owner_id?: number
  owner_name?: string
  bgg_id?: number
  year_published?: number
  created_at: string
  session_count?: number
  attachments?: GameAttachment[]
}

export interface Settings {
  id: 1
  onboarded: 0 | 1
  currency: 'USD' | 'BRL'
  language: 'en' | 'pt'
  default_owner_id?: number
  theme: 'light' | 'dark' | 'system'
  bgg_last_updated?: string
  updated_at: string
}

export interface BggGame {
  bgg_id: number
  name: string
  year_published?: number
}

export interface BggImportResult {
  imported: number
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
  avatar_path?: string
  player_type: 'person' | 'shop'
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
  notes?: string
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
  avatar_path?: string
  total_points: number
  wins: number
  total_sessions: number
  win_rate: number
}

export interface MostPlayedGame {
  id: number
  name: string
  cover_image_path?: string
  session_count: number
  unique_players: number
}

export interface HeadToHead {
  player1: { id: number; name: string; avatar_path?: string }
  player2: { id: number; name: string; avatar_path?: string }
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

      return request<Game[]>(`/games?${qs}`)
    },
    get: (id: number) => request<Game>(`/games/${id}`),
    create: (data: Omit<Game, 'id' | 'created_at' | 'session_count' | 'attachments'>) => request<Game>('/games', buildJsonRequest('POST', data)),
    update: (id: number, data: Partial<Omit<Game, 'id' | 'created_at'>>) => request<Game>(`/games/${id}`, buildJsonRequest('PUT', data)),
    delete: (id: number) => request<void>(`/games/${id}`, { method: 'DELETE' }),
    uploadCover: (id: number, file: File) => {
      const fd = new FormData()

      fd.append('cover', file)

      return request<Game>(`/games/${id}/cover`, { method: 'POST', body: fd })
    },
    uploadAttachment: (id: number, file: File, label: string) => {
      const fd = new FormData()

      fd.append('file', file)
      fd.append('label', label)

      return request<GameAttachment>(`/games/${id}/attachments`, { method: 'POST', body: fd })
    },
    deleteAttachment: (id: number, aid: number) => request<void>(`/games/${id}/attachments/${aid}`, { method: 'DELETE' }),
  },

  players: {
    list: () => request<Player[]>('/players'),
    get: (id: number) => request<Player>(`/players/${id}`),
    create: (name: string, playerType?: 'person' | 'shop') => request<Player>('/players', buildJsonRequest('POST', { name, player_type: playerType })),
    update: (id: number, name: string, playerType?: 'person' | 'shop') => request<Player>(`/players/${id}`, buildJsonRequest('PUT', { name, player_type: playerType })),
    delete: (id: number) => request<void>(`/players/${id}`, { method: 'DELETE' }),
    uploadAvatar: (id: number, file: File) => {
      const fd = new FormData()

      fd.append('avatar', file)

      return request<Player>(`/players/${id}/avatar`, { method: 'POST', body: fd })
    },
  },

  sessions: {
    list: () => request<Session[]>('/sessions'),
    get: (id: number) => request<Session>(`/sessions/${id}`),
    create: (data: { game_id: number; played_at: string; notes?: string; results: Array<{ player_id: number; rank: number }> }) =>
      request<Session>('/sessions', buildJsonRequest('POST', data)),
    delete: (id: number) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  stats: {
    leaderboard: () => request<LeaderboardEntry[]>('/stats/leaderboard'),
    leaderboardByGame: (gameId: number) => request<LeaderboardEntry[]>(`/stats/leaderboard/game/${gameId}`),
    mostPlayed: () => request<MostPlayedGame[]>('/stats/most-played'),
    leastPlayed: () => request<MostPlayedGame[]>('/stats/least-played'),
    headToHead: (player1: number, player2: number) => request<HeadToHead>(`/stats/head-to-head?player1=${player1}&player2=${player2}`),
  },

  settings: {
    get: () => request<Settings>('/settings'),
    update: (data: Partial<Omit<Settings, 'id' | 'updated_at'>>) => request<Settings>('/settings', buildJsonRequest('PUT', data)),
    reset: () => request<void>('/settings/reset', { method: 'DELETE' }),
  },

  bgg: {
    import: (file: File) => {
      const fd = new FormData()

      fd.append('file', file)

      return request<BggImportResult>('/bgg/import', { method: 'POST', body: fd })
    },
    delete: () => request<void>('/bgg', { method: 'DELETE' }),
    search: (q: string) => request<BggGame[]>(`/bgg/search?q=${encodeURIComponent(q)}`),
  },
}
