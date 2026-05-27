import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Avatar } from '@/components/atoms/avatar'
import { GameCard } from '@/components/molecules/game-card'
import { type Game, type Player } from '@/lib/http-transport/api'
import { type ScoringDirection } from '@/hooks/useScoreCounter'
import { ArrowUp, ArrowDown, BookOpen } from 'lucide-react'

// ── SetupStep ─────────────────────────────────────────────────────────────────

interface SetupStepProps {
  players: Player[]
  games: Game[]
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

export const SetupStep = ({
  players,
  games,
  selectedPlayerIds,
  gameId,
  scoringDirection,
  togglePlayer,
  setGameId,
  setScoringDirection,
  canStartCounting,
  onStart,
  onCancel,
}: SetupStepProps) => (
  <>
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
    </div>

    {/* Game card */}
    <div className='space-y-4 rounded-2xl border border-border bg-paper-secondary p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='mb-0.5 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Game · Optional</p>
          <h2 className='text-lg font-bold text-ink-primary'>What are we playing?</h2>
        </div>
      </div>

      {/* Just counting */}
      <button
        type='button'
        className={cn(
          'flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 transition-colors',
          gameId === null ? 'border-yellow-primary bg-yellow-primary/10' : 'border-border bg-paper-primary hover:bg-paper-muted',
        )}
        onClick={() => setGameId(null)}
      >
        <div className='flex aspect-square w-14 shrink-0 items-center justify-center bg-paper-muted'>
          <BookOpen size={20} className='text-ink-muted' />
        </div>
        <span className='flex-1 text-left text-sm font-bold text-ink-primary'>Just counting</span>
      </button>

      {/* Game cards horizontal scroll */}
      {games.length > 0 && (
        <div className='-mx-6 -my-6 flex gap-3 overflow-x-auto px-6 py-6'>
          {games.map((game) => (
            <GameCard key={game.id} polymorphic active={gameId === game.id} onClick={() => setGameId(game.id)} className='w-36 shrink-0' {...game} />
          ))}
        </div>
      )}
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
  </>
)
