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
  playerId: number
  total: number
  entryCount: number
  rank: number
}
