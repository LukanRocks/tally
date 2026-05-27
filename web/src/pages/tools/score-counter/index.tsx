import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { api, type Game, type Player } from '@/lib/http-transport/api'
import { useScoreCounter, type Step } from '@/hooks/useScoreCounter'
import { SetupStep } from './setup-step'
import { CountStep } from './count-step'
import { ResultStep } from './result-step'

// ── ScoreCounter ──────────────────────────────────────────────────────────────

const STEP_TITLES: Record<Step, string> = {
  setup: 'Set up the count',
  count: 'Count it up',
  result: "Here's how it went",
}

export default function ScoreCounter() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [playersLoading, setPlayersLoading] = useState(true)
  const [playersError, setPlayersError] = useState<string | null>(null)

  const hook = useScoreCounter()

  function loadPlayers() {
    setPlayersLoading(true)
    setPlayersError(null)
    api.players
      .list()
      .then((p) => setPlayers(p))
      .catch((e) => setPlayersError(e.message ?? 'Failed to load players'))
      .finally(() => setPlayersLoading(false))
  }

  useEffect(() => {
    loadPlayers()
    api.games.list().then((g) => setGames(g))
  }, [])

  const personPlayers = players.filter((p) => p.player_type === 'person')

  function handleCreateSession() {
    navigate('/sessions/new', {
      state: {
        players: hook.rankedResults.map((r) => ({ id: r.playerId, rank: r.rank })),
        gameId: hook.gameId ?? undefined,
      },
    })
  }

  const pageClasses = cn('flex min-h-screen flex-col bg-paper-primary')

  return (
    <div data-slot='score-counter' className={pageClasses}>
      {/* Page header */}
      <div className='flex items-start justify-between gap-4 px-5 pt-5 pb-4'>
        <div>
          <p className='mb-1 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Tool · Score Counter</p>
          <h1 className='text-3xl font-bold text-ink-primary'>{STEP_TITLES[hook.step]}</h1>
        </div>
      </div>

      {hook.step === 'setup' && (
        <SetupStep
          players={personPlayers}
          games={games}
          playersLoading={playersLoading}
          playersError={playersError}
          onRetryPlayers={loadPlayers}
          selectedPlayerIds={hook.selectedPlayerIds}
          gameId={hook.gameId}
          scoringDirection={hook.scoringDirection}
          togglePlayer={hook.togglePlayer}
          setGameId={hook.setGameId}
          setScoringDirection={hook.setScoringDirection}
          canStartCounting={hook.canStartCounting}
          onStart={hook.startCounting}
          onCancel={() => navigate('/tools')}
        />
      )}

      {hook.step === 'count' && hook.activePlayerId !== null && (
        <CountStep
          selectedPlayerIds={hook.selectedPlayerIds}
          players={personPlayers}
          scores={hook.scores}
          activePlayerId={hook.activePlayerId}
          inputBuffer={hook.inputBuffer}
          canCommitBuffer={hook.canCommitBuffer}
          setActivePlayer={hook.setActivePlayer}
          applyQuickAdd={hook.applyQuickAdd}
          appendDigit={hook.appendDigit}
          toggleSign={hook.toggleSign}
          backspace={hook.backspace}
          commitBuffer={hook.commitBuffer}
          undoLast={hook.undoLast}
          onViewResults={hook.viewResults}
        />
      )}

      {hook.step === 'result' && (
        <ResultStep
          rankedResults={hook.rankedResults}
          players={personPlayers}
          scoringDirection={hook.scoringDirection}
          gameId={hook.gameId}
          onNewCount={hook.newCount}
          onCreateSession={handleCreateSession}
          onDone={() => navigate('/tools')}
        />
      )}
    </div>
  )
}
