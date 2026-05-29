import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/1-atoms/button'
import { api, type Game, type Player } from '@/lib/http-transport/api'

import { type Step, type ScoringDirection, type PlayerScore, type RankedResult } from './types'
import { SetupStep } from './setup-step'
import { CountStep } from './count-step'
import { ResultStep } from './result-step'

export default () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    setLoading(true)

    Promise.all([api.players.list(), api.games.list()])
      .then(([players, games]) => {
        setPlayers(players.filter((p) => p.player_type === 'person'))
        setGames(games)
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const [step, setStep] = useState<Step>('setup')
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [selectedGameId, setSelectedGameId] = useState<number>()
  const [scoringDirection, setScoringDirection] = useState<ScoringDirection>('highest')
  const [scores, setScores] = useState<Record<number, PlayerScore>>({})

  const withIndex = selectedPlayers.map((player, index) => ({
    player,
    total: scores[player.id]?.total ?? 0,
    index,
  }))

  const sorted = [...withIndex].sort((a, b) => {
    const diff = scoringDirection === 'highest' ? b.total - a.total : a.total - b.total

    return diff !== 0 ? diff : a.index - b.index
  })

  const rankedResults: RankedResult[] = sorted.map((item, i) => ({ player: item.player, total: item.total, rank: i + 1 }))

  const STEPS: Record<Step, { title: string; nextLabel: string; back: () => void; next: () => void }> = {
    setup: {
      title: 'Set up the count',
      nextLabel: 'Start counting',
      back: () => navigate('/tools'),
      next: () => setStep('count'),
    },
    count: {
      title: 'Count it up',
      nextLabel: 'View results',
      back: () => setStep('setup'),
      next: () => setStep('result'),
    },
    result: {
      title: "Here's how it went",
      nextLabel: 'Create session',
      back: () => setStep('count'),
      next: () => navigate('/sessions/new', { state: { players: rankedResults.map((r) => ({ id: r.player.id, rank: r.rank })), gameId: selectedGameId } }),
    },
  }

  return (
    !loading && (
      <Page>
        <PageHeader title={STEPS[step].title} caption='Tool · Score Counter' />

        <div className='flex flex-1 flex-col gap-4'>
          {step === 'setup' && (
            <SetupStep
              players={players}
              games={games}
              selectedPlayers={selectedPlayers}
              selectedGameId={selectedGameId}
              scoringDirection={scoringDirection}
              setSelectedPlayers={setSelectedPlayers}
              setSelectedGameId={setSelectedGameId}
              setScoringDirection={setScoringDirection}
            />
          )}

          {step === 'count' && <CountStep selectedPlayers={selectedPlayers} scores={scores} onScoresChange={setScores} />}

          {step === 'result' && <ResultStep rankedResults={rankedResults} scoringDirection={scoringDirection} />}
        </div>

        <div className='flex items-center justify-between gap-2'>
          <Button variant='ghost' size='big' color='secondary' onClick={STEPS[step].back}>
            <ChevronLeft />
            Back
          </Button>

          {step === 'setup' && <span className='text-right text-xs text-ink-muted italic'>{selectedPlayers.length >= 2 ? 'ready when you are' : 'pick at least 2 players'}</span>}

          <Button size='big' variant='ghost' disabled={selectedPlayers.length < 2} onClick={STEPS[step].next}>
            {STEPS[step].nextLabel}
            <ChevronRight />
          </Button>
        </div>
      </Page>
    )
  )
}
