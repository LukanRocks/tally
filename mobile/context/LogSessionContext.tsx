import { createContext, useContext, useState } from 'react'
import type { Game, Player } from '../lib/types'

interface LogSessionState {
  game: Game | null
  players: Player[]
}

interface LogSessionContextType extends LogSessionState {
  setGame: (game: Game) => void
  setPlayers: (players: Player[]) => void
  reset: () => void
}

const LogSessionContext = createContext<LogSessionContextType | null>(null)

export function LogSessionProvider({ children }: { children: React.ReactNode }) {
  const [game, setGameState] = useState<Game | null>(null)
  const [players, setPlayersState] = useState<Player[]>([])

  const setGame = (g: Game) => setGameState(g)
  const setPlayers = (p: Player[]) => setPlayersState(p)
  const reset = () => {
    setGameState(null)
    setPlayersState([])
  }

  return (
    <LogSessionContext.Provider value={{ game, players, setGame, setPlayers, reset }}>
      {children}
    </LogSessionContext.Provider>
  )
}

export function useLogSession(): LogSessionContextType {
  const ctx = useContext(LogSessionContext)
  if (!ctx) throw new Error('useLogSession must be used within LogSessionProvider')
  return ctx
}
