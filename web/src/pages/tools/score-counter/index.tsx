import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Page, PageHeader } from '@/components/layout/page'

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
  const [loading, setLoading] = useState(true)

  const hook = useScoreCounter()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [players, games] = await Promise.all([api.players.list(), api.games.list()])

      setPlayers(players.filter((player) => player.player_type === 'person'))
      setGames(games)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data', { action: { label: 'Retry', onClick: fetchData } })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function handleCreateSession() {
    navigate('/sessions/new', {
      state: {
        players: hook.rankedResults.map((r) => ({ id: r.playerId, rank: r.rank })),
        gameId: hook.gameId ?? undefined,
      },
    })
  }

  return (
    !loading && (
      <Page>
        <PageHeader title={STEP_TITLES[hook.step]} caption='Tool · Score Counter' />

        {hook.step === 'setup' && (
          <SetupStep
            players={players}
            games={games}
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
            players={players}
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
            players={players}
            scoringDirection={hook.scoringDirection}
            gameId={hook.gameId}
            onNewCount={hook.newCount}
            onCreateSession={handleCreateSession}
            onDone={() => navigate('/tools')}
          />
        )}
      </Page>
    )
  )
}
