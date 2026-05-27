import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, RotateCcw, Delete, ArrowUp, ArrowDown, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Avatar } from '@/components/atoms/avatar'
import { api, type Game, type Player } from '@/lib/http-transport/api'
import { useScoreCounter, type RankedResult, type PlayerScore, type ScoringDirection, type Step } from '@/hooks/useScoreCounter'
import { getPlayerColor } from '@/lib/deterministic-picker'

// ── SetupStep ─────────────────────────────────────────────────────────────────

interface SetupStepProps {
  players: Player[]
  games: Game[]
  playersLoading: boolean
  playersError: string | null
  onRetryPlayers: () => void
  selectedPlayerIds: number[]
  gameId: number | null
  scoringDirection: ScoringDirection
  togglePlayer: (id: number) => void
  setGameId: (id: number | null) => void
  setScoringDirection: (dir: ScoringDirection) => void
  canStartCounting: boolean
  onStart: () => void
  onCancel: () => void
}

function SetupStep({
  players,
  games,
  playersLoading,
  playersError,
  onRetryPlayers,
  selectedPlayerIds,
  gameId,
  scoringDirection,
  togglePlayer,
  setGameId,
  setScoringDirection,
  canStartCounting,
  onStart,
  onCancel,
}: SetupStepProps) {
  return (
    <div data-slot='score-counter-setup' className='flex flex-col gap-4 p-4'>
      {/* Players card */}
      <div className='rounded-2xl border border-border bg-paper-secondary p-5'>
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div>
            <p className='mb-0.5 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Players</p>
            <h2 className='text-lg font-bold text-ink-primary'>Who's at the table?</h2>
          </div>
          {selectedPlayerIds.length > 0 && (
            <span className='mt-0.5 shrink-0 rounded-full bg-yellow-primary px-3 py-1 text-xs font-bold text-ink-on-yellow'>{selectedPlayerIds.length} picked</span>
          )}
        </div>

        {playersError && (
          <div className='mb-3 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive'>
            <span className='flex-1'>{playersError}</span>
            <button onClick={onRetryPlayers} className='font-semibold underline underline-offset-2'>
              Retry
            </button>
          </div>
        )}

        {playersLoading && !playersError && (
          <div className='flex gap-2 overflow-hidden'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-10 w-28 shrink-0 animate-pulse rounded-full bg-paper-muted' />
            ))}
          </div>
        )}

        {!playersLoading && !playersError && (
          <div className='flex gap-2 overflow-x-auto pb-1'>
            {players.map((player) => {
              const selected = selectedPlayerIds.includes(player.id)
              const chipClasses = cn(
                'flex shrink-0 items-center gap-2 rounded-full border-2 py-1.5 pr-3 pl-1.5 transition-colors',
                selected ? 'border-yellow-primary bg-yellow-primary/10' : 'border-border bg-paper-primary hover:border-ink-muted',
              )
              return (
                <button key={player.id} className={chipClasses} onClick={() => togglePlayer(player.id)}>
                  <Avatar id={player.id} name={player.name} avatar_path={player.avatar_path} size='sm' />
                  <span className='text-sm font-semibold text-ink-primary'>{player.name}</span>
                  {selected && <Check size={13} className='text-yellow-secondary' />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Game card */}
      <div className='rounded-2xl border border-border bg-paper-secondary p-5'>
        <div className='mb-4 flex items-start justify-between gap-4'>
          <div>
            <p className='mb-0.5 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Game · Optional</p>
            <h2 className='text-lg font-bold text-ink-primary'>What are we playing?</h2>
          </div>
        </div>

        {/* Game cards horizontal scroll */}
        <div className='flex gap-3 overflow-x-auto pb-1'>
          {/* Just counting */}
          <button
            className={cn('flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border-2 transition-colors', gameId === null ? 'border-yellow-primary' : 'border-transparent')}
            onClick={() => setGameId(null)}
          >
            <div className='flex h-20 w-full items-center justify-center bg-paper-muted'>
              <BookOpen size={22} className='text-ink-muted' />
            </div>
            <div className={cn('px-2 py-1.5', gameId === null ? 'bg-yellow-primary/10' : 'bg-paper-primary')}>
              <p className='line-clamp-2 text-xs font-medium text-ink-primary'>Just counting</p>
            </div>
          </button>

          {games.map((game) => {
            const isActive = gameId === game.id
            return (
              <button
                key={game.id}
                className={cn('flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border-2 transition-colors', isActive ? 'border-yellow-primary' : 'border-transparent')}
                onClick={() => setGameId(game.id)}
              >
                {game.cover_image_path ? (
                  <img src={game.cover_image_path} alt={game.name} className='h-20 w-full object-cover' />
                ) : (
                  <div className='flex h-20 w-full items-center justify-center bg-paper-muted text-3xl font-bold text-ink-muted'>{game.name[0]}</div>
                )}
                <div className={cn('px-2 py-1.5', isActive ? 'bg-yellow-primary/10' : 'bg-paper-primary')}>
                  <p className='line-clamp-2 text-xs font-medium text-ink-primary'>{game.name}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Scoring direction card */}
      <div className='rounded-2xl border border-border bg-paper-secondary p-5'>
        <div className='mb-4'>
          <p className='mb-0.5 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Scoring</p>
          <h2 className='text-lg font-bold text-ink-primary'>Which way is up?</h2>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          {(['highest', 'lowest'] as ScoringDirection[]).map((direction) => {
            const active = direction === scoringDirection
            const Icon = direction === 'highest' ? ArrowUp : ArrowDown
            const label = direction === 'highest' ? 'Highest wins' : 'Lowest wins'
            const desc = direction === 'highest' ? 'most points takes it' : 'the lower the better'

            return (
              <button
                key={direction}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors',
                  active ? 'border-yellow-primary bg-yellow-primary/10' : 'border-border bg-paper-primary hover:bg-paper-muted',
                )}
                onClick={() => setScoringDirection(direction)}
              >
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', active ? 'bg-yellow-primary' : 'bg-paper-muted')}>
                  <Icon size={18} className={active ? 'text-ink-on-yellow' : 'text-ink-secondary'} />
                </div>
                <div className='flex flex-col gap-0.5'>
                  <span className='font-bold text-ink-primary'>{label}</span>
                  <span className='text-xs text-ink-muted'>{desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' color='secondary' onClick={onCancel}>
          Cancel
        </Button>
        <span className='text-xs text-ink-muted italic'>{canStartCounting ? 'ready when you are' : 'pick at least 2 players'}</span>
        <Button size='big' disabled={!canStartCounting} onClick={onStart}>
          Start counting →
        </Button>
      </div>
    </div>
  )
}

// ── CountStep ─────────────────────────────────────────────────────────────────

interface CountStepProps {
  selectedPlayerIds: number[]
  players: Player[]
  scores: Record<number, PlayerScore>
  activePlayerId: number
  inputBuffer: string
  canCommitBuffer: boolean
  setActivePlayer: (id: number) => void
  applyQuickAdd: (value: number) => void
  appendDigit: (digit: string) => void
  toggleSign: () => void
  backspace: () => void
  commitBuffer: () => void
  undoLast: () => void
  onViewResults: () => void
}

const QUICK_ADDS_POS = [1, 5, 10, 25, 50, 100]
const QUICK_ADDS_NEG = [-1, -5]
const NUMPAD_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['±', '0', '⌫'],
]

function CountStep({
  selectedPlayerIds,
  players,
  scores,
  activePlayerId,
  inputBuffer,
  canCommitBuffer,
  setActivePlayer,
  applyQuickAdd,
  appendDigit,
  toggleSign,
  backspace,
  commitBuffer,
  undoLast,
  onViewResults,
}: CountStepProps) {
  const activePlayer = players.find((p) => p.id === activePlayerId)
  const activeScore = scores[activePlayerId]
  const inactivePlayers = selectedPlayerIds.filter((id) => id !== activePlayerId)

  const bufferDisplay = inputBuffer === '' ? '0' : inputBuffer.startsWith('-') ? '−' + inputBuffer.slice(1) : inputBuffer

  return (
    <div data-slot='score-counter-count' className='flex flex-col pb-24'>
      <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
        {/* Score sheet */}
        <div className='flex flex-col gap-3'>
          {/* Active player card */}
          {activePlayer && (
            <div className='relative overflow-hidden rounded-xl border border-border p-4'>
              <div className='pointer-events-none absolute inset-0' style={{ backgroundColor: getPlayerColor(activePlayerId), opacity: 0.12 }} />
              <div className='relative flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full' style={{ outline: `2px solid ${getPlayerColor(activePlayerId)}`, outlineOffset: '2px' }}>
                    <Avatar id={activePlayer.id} name={activePlayer.name} avatar_path={activePlayer.avatar_path} size='sm' />
                  </div>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-ink-primary'>{activePlayer.name}</span>
                      <span className='rounded-full bg-yellow-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-on-yellow uppercase'>Active</span>
                    </div>
                    <span className='text-xs text-ink-muted'>{activeScore?.entries.length ?? 0} entries</span>
                  </div>
                  <span className='ml-auto text-3xl font-bold text-ink-primary tabular-nums'>{activeScore?.total ?? 0}</span>
                </div>

                {/* Entries */}
                <div className='flex flex-col gap-1.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold tracking-wide text-ink-muted uppercase'>Entries</span>
                    {(activeScore?.entries.length ?? 0) > 0 && (
                      <button onClick={undoLast} className='text-xs font-medium text-ink-secondary underline underline-offset-2'>
                        Undo last
                      </button>
                    )}
                  </div>

                  {(activeScore?.entries.length ?? 0) === 0 ? (
                    <p className='text-xs text-ink-muted italic'>No points yet — tap a number or quick-add to start</p>
                  ) : (
                    <div className='flex flex-wrap gap-1.5'>
                      {activeScore.entries.map((entry, i) => {
                        const entryClasses = cn(
                          'rounded-lg px-2 py-1 font-mono text-xs font-medium',
                          entry.value > 0 ? 'bg-paper-secondary text-ink-primary' : 'bg-destructive/10 text-destructive',
                        )
                        return (
                          <span key={i} className={entryClasses}>
                            #{i + 1} {entry.value > 0 ? '+' : ''}
                            {entry.value}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inactive player rows */}
          {inactivePlayers.map((id) => {
            const player = players.find((p) => p.id === id)
            if (!player) return null
            const score = scores[id]
            return (
              <button
                key={id}
                className='flex items-center gap-3 rounded-xl border border-border bg-paper-secondary px-4 py-3 transition-colors hover:bg-paper-muted'
                onClick={() => setActivePlayer(id)}
              >
                <Avatar id={player.id} name={player.name} avatar_path={player.avatar_path} size='sm' />
                <span className='flex-1 text-left text-sm font-medium text-ink-primary'>{player.name}</span>
                <span className='text-xs text-ink-muted'>{score?.entries.length ?? 0} entries</span>
                <span className='w-12 text-right text-base font-bold text-ink-primary tabular-nums'>{score?.total ?? 0}</span>
              </button>
            )
          })}
        </div>

        {/* Input panel */}
        <div className='flex flex-col gap-4'>
          {/* Quick add */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs font-semibold tracking-wide text-ink-muted uppercase'>Quick Add</span>
            <div className='flex flex-wrap gap-2'>
              {QUICK_ADDS_NEG.map((v) => (
                <Button key={v} size='small' variant='outline' color='destructive' onClick={() => applyQuickAdd(v)}>
                  {v}
                </Button>
              ))}
              {QUICK_ADDS_POS.map((v) => (
                <Button key={v} size='small' variant='outline' color='secondary' onClick={() => applyQuickAdd(v)}>
                  +{v}
                </Button>
              ))}
            </div>
          </div>

          {/* Numpad */}
          <div className='flex flex-col gap-2'>
            <div
              className={cn(
                'rounded-xl border border-border bg-paper-secondary px-4 py-3 text-right font-mono text-2xl font-bold tabular-nums',
                inputBuffer === '' ? 'text-ink-muted' : 'text-ink-primary',
              )}
            >
              {bufferDisplay}
            </div>

            <div className='grid grid-cols-3 gap-2'>
              {NUMPAD_ROWS.flat().map((key) => {
                function handleKey() {
                  if (key === '±') toggleSign()
                  else if (key === '⌫') backspace()
                  else appendDigit(key)
                }
                const isAction = key === '±' || key === '⌫'
                const keyClasses = cn(
                  'flex h-14 items-center justify-center rounded-xl border text-base font-semibold transition-colors select-none',
                  isAction
                    ? 'border-border bg-paper-secondary text-ink-secondary hover:bg-paper-muted'
                    : 'border-border bg-paper-primary text-ink-primary hover:bg-paper-secondary active:bg-paper-muted',
                )
                return (
                  <button key={key} className={keyClasses} onClick={handleKey}>
                    {key === '⌫' ? <Delete size={18} /> : key}
                  </button>
                )
              })}
            </div>

            <Button className='w-full' size='big' disabled={!canCommitBuffer} onClick={commitBuffer}>
              Add +
            </Button>
          </div>
        </div>
      </div>

      {/* View results footer */}
      <div className='fixed right-0 bottom-0 left-0 border-t border-border bg-paper-primary p-4'>
        <Button className='w-full' size='big' variant='outline' color='secondary' onClick={onViewResults}>
          View results →
        </Button>
      </div>
    </div>
  )
}

// ── ResultStep ────────────────────────────────────────────────────────────────

interface ResultStepProps {
  rankedResults: RankedResult[]
  players: Player[]
  scoringDirection: ScoringDirection
  gameId: number | null
  onNewCount: () => void
  onCreateSession: () => void
  onDone: () => void
}

function ResultStep({ rankedResults, players, scoringDirection, onNewCount, onCreateSession, onDone }: ResultStepProps) {
  const winner = rankedResults[0]
  const winnerPlayer = winner ? players.find((p) => p.id === winner.playerId) : undefined
  const maxAbsTotal = Math.max(...rankedResults.map((r) => Math.abs(r.total)), 0)

  function barWidth(result: RankedResult) {
    if (maxAbsTotal === 0) return '10%'
    return `${(Math.abs(result.total) / maxAbsTotal) * 100}%`
  }

  const heroClasses = cn('relative overflow-hidden rounded-2xl border border-border p-6 text-center')
  const rankingHeaderLabel = scoringDirection === 'highest' ? 'RANKING · HIGH TO LOW' : 'RANKING · LOW TO HIGH'
  const winnerCopy = scoringDirection === 'highest' ? 'top of the heap' : 'fewest points wins'

  return (
    <div data-slot='score-counter-result' className='flex flex-col gap-4 p-4 pb-28'>
      {/* Winner hero */}
      {winner && winnerPlayer && (
        <div className={heroClasses}>
          <div className='pointer-events-none absolute inset-0' style={{ backgroundColor: getPlayerColor(winner.playerId), opacity: 0.15 }} />
          <div className='relative flex flex-col items-center gap-3'>
            <p className='text-sm text-ink-secondary italic'>{winnerCopy}</p>
            <div className='rounded-full' style={{ outline: `3px solid ${getPlayerColor(winner.playerId)}`, outlineOffset: '3px' }}>
              <Avatar id={winnerPlayer.id} name={winnerPlayer.name} avatar_path={winnerPlayer.avatar_path} size='xl' />
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div className='flex items-center gap-2'>
                <Crown size={18} style={{ color: getPlayerColor(winner.playerId) }} />
                <span className='text-xl font-bold text-ink-primary'>{winnerPlayer.name}</span>
              </div>
              <span className='text-xs text-ink-muted'>{winner.entryCount} entries</span>
              <div className='flex items-baseline gap-1'>
                <span className='text-4xl font-bold text-ink-primary tabular-nums'>{winner.total}</span>
                <span className='text-sm font-semibold tracking-wide text-ink-muted uppercase'>points</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-bold tracking-wide text-ink-primary uppercase'>{rankingHeaderLabel}</p>
            <p className='text-xs text-ink-muted'>How everyone stacked up</p>
          </div>
          <span className='text-xs font-medium text-ink-muted'>{rankedResults.length} players</span>
        </div>

        {rankedResults.map((result) => {
          const player = players.find((p) => p.id === result.playerId)
          if (!player) return null
          const isWinner = result.rank === 1
          const rowClasses = cn('flex flex-col gap-2 rounded-xl border border-border p-4', isWinner ? 'bg-yellow-primary/8' : 'bg-paper-secondary')
          return (
            <div key={result.playerId} className={rowClasses}>
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    isWinner ? 'bg-yellow-primary text-ink-on-yellow' : 'bg-paper-muted text-ink-secondary',
                  )}
                >
                  {result.rank}
                </span>
                <Avatar id={player.id} name={player.name} avatar_path={player.avatar_path} size='sm' />
                <span className='flex-1 font-medium text-ink-primary'>{player.name}</span>
                {isWinner && <span className='rounded-full bg-yellow-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-on-yellow uppercase'>Winner</span>}
                <span className='text-xs text-ink-muted'>{result.entryCount} entries</span>
                <span className='w-14 text-right text-base font-bold text-ink-primary tabular-nums'>{result.total}</span>
              </div>

              {/* Bar chart */}
              <div className='h-2 overflow-hidden rounded-full bg-paper-muted'>
                <div className='h-full rounded-full transition-all' style={{ width: barWidth(result), backgroundColor: getPlayerColor(result.playerId) }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div className='fixed right-0 bottom-0 left-0 flex gap-2 border-t border-border bg-paper-primary p-4'>
        <Button variant='ghost' color='secondary' onClick={onDone}>
          Done
        </Button>
        <Button variant='outline' color='secondary' className='flex items-center gap-1.5' onClick={onNewCount}>
          <RotateCcw size={14} />
          New count
        </Button>
        <Button className='flex-1' onClick={onCreateSession}>
          Create session
        </Button>
      </div>
    </div>
  )
}

// ── ScoreCounter ──────────────────────────────────────────────────────────────

const STEP_TITLES: Record<Step, string> = {
  setup: 'Set up the count',
  count: 'Count it up',
  result: "Here's how it went",
}

const STEP_NUMBERS: Record<Step, number> = { setup: 1, count: 2, result: 3 }

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
