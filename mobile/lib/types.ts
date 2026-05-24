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
  bgg_id: number | null
  year_published: number | null
  created_at: string
  session_count?: number
  attachments?: GameAttachment[]
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

export interface SessionCreatePayload {
  game_id: number
  played_at: string
  notes?: string
  results: Array<{ player_id: number; rank: number }>
}
