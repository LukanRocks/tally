import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Avatar } from '@/components/atoms/avatar'
import { type Game, type Player } from '@/lib/http-transport/api'
import { type ScoringDirection } from '@/hooks/useScoreCounter'
import { ArrowUp, ArrowDown, BookOpen } from 'lucide-react'

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

export function SetupStep({
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
