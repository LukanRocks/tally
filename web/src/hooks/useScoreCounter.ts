import { useState, useMemo } from 'react'

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

interface ScoreCounterState {
  step: Step
  selectedPlayerIds: number[]
  gameId: number | null
  scoringDirection: ScoringDirection
  scores: Record<number, PlayerScore>
  activePlayerId: number | null
  inputBuffer: string
}

const INITIAL_STATE: ScoreCounterState = {
  step: 'setup',
  selectedPlayerIds: [],
  gameId: null,
  scoringDirection: 'highest',
  scores: {},
  activePlayerId: null,
  inputBuffer: '',
}

export function useScoreCounter() {
  const [state, setState] = useState<ScoreCounterState>(INITIAL_STATE)

  function togglePlayer(id: number) {
    setState((s) => ({
      ...s,
      selectedPlayerIds: s.selectedPlayerIds.includes(id)
        ? s.selectedPlayerIds.filter((pid) => pid !== id)
        : [...s.selectedPlayerIds, id],
    }))
  }

  function setGameId(id: number | null) {
    setState((s) => ({ ...s, gameId: id }))
  }

  function setScoringDirection(dir: ScoringDirection) {
    setState((s) => ({ ...s, scoringDirection: dir }))
  }

  function startCounting() {
    setState((s) => {
      const scores: Record<number, PlayerScore> = {}
      for (const id of s.selectedPlayerIds) {
        scores[id] = { entries: [], total: 0 }
      }
      return { ...s, step: 'count', scores, activePlayerId: s.selectedPlayerIds[0], inputBuffer: '' }
    })
  }

  function setActivePlayer(id: number) {
    setState((s) => ({ ...s, activePlayerId: id, inputBuffer: '' }))
  }

  function applyQuickAdd(value: number) {
    setState((s) => {
      if (!s.activePlayerId) return s
      const prev = s.scores[s.activePlayerId]
      const entries = [...prev.entries, { value }]
      return {
        ...s,
        scores: { ...s.scores, [s.activePlayerId]: { entries, total: entries.reduce((sum, e) => sum + e.value, 0) } },
      }
    })
  }

  function appendDigit(digit: string) {
    setState((s) => {
      const buf = s.inputBuffer
      if (buf === '' || buf === '0') return { ...s, inputBuffer: digit }
      if (buf === '-') return { ...s, inputBuffer: '-' + digit }
      return { ...s, inputBuffer: buf + digit }
    })
  }

  function toggleSign() {
    setState((s) => {
      if (!s.inputBuffer || s.inputBuffer === '0') return s
      return {
        ...s,
        inputBuffer: s.inputBuffer.startsWith('-') ? s.inputBuffer.slice(1) : '-' + s.inputBuffer,
      }
    })
  }

  function backspace() {
    setState((s) => ({ ...s, inputBuffer: s.inputBuffer.slice(0, -1) }))
  }

  function commitBuffer() {
    setState((s) => {
      if (!s.activePlayerId || !s.inputBuffer || s.inputBuffer === '-') return s
      const value = parseInt(s.inputBuffer, 10)
      if (isNaN(value) || value === 0) return s
      const prev = s.scores[s.activePlayerId]
      const entries = [...prev.entries, { value }]
      return {
        ...s,
        inputBuffer: '',
        scores: { ...s.scores, [s.activePlayerId]: { entries, total: entries.reduce((sum, e) => sum + e.value, 0) } },
      }
    })
  }

  function undoLast() {
    setState((s) => {
      if (!s.activePlayerId) return s
      const prev = s.scores[s.activePlayerId]
      if (!prev.entries.length) return s
      const entries = prev.entries.slice(0, -1)
      return {
        ...s,
        scores: { ...s.scores, [s.activePlayerId]: { entries, total: entries.reduce((sum, e) => sum + e.value, 0) } },
      }
    })
  }

  function viewResults() {
    setState((s) => ({ ...s, step: 'result' }))
  }

  function newCount() {
    setState(INITIAL_STATE)
  }

  const rankedResults = useMemo((): RankedResult[] => {
    const { selectedPlayerIds, scores, scoringDirection } = state
    const withIndex = selectedPlayerIds.map((id, index) => ({
      playerId: id,
      total: scores[id]?.total ?? 0,
      entryCount: scores[id]?.entries.length ?? 0,
      index,
    }))
    const sorted = [...withIndex].sort((a, b) => {
      const diff = scoringDirection === 'highest' ? b.total - a.total : a.total - b.total
      return diff !== 0 ? diff : a.index - b.index
    })
    return sorted.map((player, i) => ({ playerId: player.playerId, total: player.total, entryCount: player.entryCount, rank: i + 1 }))
  }, [state])

  const canStartCounting = state.selectedPlayerIds.length >= 2
  const parsedBuffer = parseInt(state.inputBuffer, 10)
  const canCommitBuffer = state.inputBuffer !== '' && state.inputBuffer !== '-' && !isNaN(parsedBuffer) && parsedBuffer !== 0

  return {
    ...state,
    togglePlayer,
    setGameId,
    setScoringDirection,
    startCounting,
    setActivePlayer,
    applyQuickAdd,
    appendDigit,
    toggleSign,
    backspace,
    commitBuffer,
    undoLast,
    viewResults,
    newCount,
    rankedResults,
    canStartCounting,
    canCommitBuffer,
  }
}
