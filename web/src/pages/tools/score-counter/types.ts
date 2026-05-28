import { type Player } from '@/lib/http-transport/api'
export type Step = 'setup' | 'count' | 'result'
export type ScoringDirection = 'highest' | 'lowest'

export interface PlayerEntry {
  value: number
}

export interface PlayerScore {
  entries: PlayerEntry[]
  total: number
}

export interface RankedResult {
  player: Player
  total: number
  rank: number
}
