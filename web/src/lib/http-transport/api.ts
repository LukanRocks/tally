import { perform, request } from './helpers'

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
  owner_player_type?: 'person' | 'shop'
  bgg_id?: number
  year_published?: number
  created_at: string
  session_count?: number
  attachments?: GameAttachment[]
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

      return perform<Game[]>(`/games?${qs}`)
    },
    get: (id: number) => perform<Game>(`/games/${id}`),
    create: (data: Omit<Game, 'id' | 'created_at' | 'session_count' | 'attachments'>) => perform<Game>('/games', request('POST', data)),
    update: (id: number, data: Partial<Omit<Game, 'id' | 'created_at'>>) => perform<Game>(`/games/${id}`, request('PUT', data)),
    delete: (id: number) => perform<void>(`/games/${id}`, { method: 'DELETE' }),
    uploadCover: (id: number, file: File) => {
      const fd = new FormData()

      fd.append('cover', file)

      return perform<Game>(`/games/${id}/cover`, { method: 'POST', body: fd })
    },
    uploadAttachment: (id: number, file: File, label: string) => {
      const fd = new FormData()

      fd.append('file', file)
      fd.append('label', label)

      return perform<GameAttachment>(`/games/${id}/attachments`, { method: 'POST', body: fd })
    },
    deleteAttachment: (id: number, aid: number) => perform<void>(`/games/${id}/attachments/${aid}`, { method: 'DELETE' }),
  },

  players: {
    list: () => perform<Player[]>('/players'),
    get: (id: number) => perform<Player>(`/players/${id}`),
    create: (name: string, playerType?: 'person' | 'shop') => perform<Player>('/players', request('POST', { name, player_type: playerType })),
    update: (id: number, name: string, playerType?: 'person' | 'shop') => perform<Player>(`/players/${id}`, request('PUT', { name, player_type: playerType })),
    delete: (id: number) => perform<void>(`/players/${id}`, { method: 'DELETE' }),
    uploadAvatar: (id: number, file: File) => {
      const fd = new FormData()

      fd.append('avatar', file)

      return perform<Player>(`/players/${id}/avatar`, { method: 'POST', body: fd })
    },
  },

  sessions: {
    list: () => perform<Session[]>('/sessions'),
    get: (id: number) => perform<Session>(`/sessions/${id}`),
    create: (data: { game_id: number; played_at: string; notes?: string; results: Array<{ player_id: number; rank: number }> }) =>
      perform<Session>('/sessions', request('POST', data)),
    delete: (id: number) => perform<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  stats: {
    leaderboard: () => perform<LeaderboardEntry[]>('/stats/leaderboard'),
    leaderboardByGame: (gameId: number) => perform<LeaderboardEntry[]>(`/stats/leaderboard/game/${gameId}`),
    mostPlayed: () => perform<MostPlayedGame[]>('/stats/most-played'),
    leastPlayed: () => perform<MostPlayedGame[]>('/stats/least-played'),
    headToHead: (player1: number, player2: number) => perform<HeadToHead>(`/stats/head-to-head?player1=${player1}&player2=${player2}`),
  },

  bgg: {
    import: (file: File) => {
      const fd = new FormData()

      fd.append('file', file)

      return perform<BggImportResult>('/bgg/import', { method: 'POST', body: fd })
    },
    delete: () => perform<void>('/bgg', { method: 'DELETE' }),
    search: (q: string) => perform<BggGame[]>(`/bgg/search?q=${encodeURIComponent(q)}`),
  },
}
