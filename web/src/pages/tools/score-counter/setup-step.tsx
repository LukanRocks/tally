import { type Dispatch, type SetStateAction } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/1-atoms/avatar'
import { GameCard } from '@/components/molecules/game-card'
import { type Game, type Player } from '@/lib/http-transport/api'
import { type ScoringDirection } from './types'
import { ArrowUp, ArrowDown, Calculator } from 'lucide-react'

// ── SetupStep ─────────────────────────────────────────────────────────────────

interface SetupStepProps {
  players: Player[]
  games: Game[]
  selectedPlayers: Player[]
  selectedGameId?: number
  scoringDirection: ScoringDirection
  setSelectedPlayers: Dispatch<SetStateAction<Player[]>>
  setSelectedGameId: (id?: number) => void
  setScoringDirection: (dir: ScoringDirection) => void
}

export const SetupStep = ({ players, games, selectedPlayers, selectedGameId, scoringDirection, setSelectedPlayers, setSelectedGameId, setScoringDirection }: SetupStepProps) => (
  <>
    {/* Players card */}
    <div className='rounded-2xl border border-border bg-paper-secondary p-5'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <p className='mb-0.5 text-[11px] font-semibold tracking-widest text-ink-muted uppercase'>Players</p>
          <h2 className='text-lg font-bold text-ink-primary'>Who's at the table?</h2>
        </div>
        {selectedPlayers.length > 0 && (
          <span className='mt-0.5 shrink-0 rounded-full bg-yellow-primary px-3 py-1 text-xs font-bold text-ink-on-yellow'>{selectedPlayers.length} picked</span>
        )}
      </div>

      <div className='flex gap-2 overflow-x-auto pb-1'>
        {players.map((player) => {
          const selected = selectedPlayers.some((p) => p.id === player.id)
          const chipClasses = cn(
            'flex shrink-0 items-center gap-2 rounded-full border-2 py-1.5 pr-3 pl-1.5 transition-colors',
            selected ? 'border-yellow-primary bg-yellow-primary/10' : 'border-border bg-paper-primary hover:border-ink-muted',
          )
          return (
            <button
              key={player.id}
              className={chipClasses}
              onClick={() => setSelectedPlayers((prev) => (prev.some((p) => p.id === player.id) ? prev.filter((p) => p.id !== player.id) : [...prev, player]))}
            >
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
          selectedGameId === undefined ? 'border-yellow-primary bg-yellow-primary/10' : 'border-border bg-paper-primary hover:bg-paper-muted',
        )}
        onClick={() => setSelectedGameId(undefined)}
      >
        <div className='flex aspect-square w-14 shrink-0 items-center justify-center bg-paper-muted'>
          <Calculator size={20} className='text-ink-muted' />
        </div>
        <span className='flex-1 text-left text-sm font-bold text-ink-primary'>Just counting</span>
      </button>

      {/* Game cards horizontal scroll */}
      {games.length > 0 && (
        <div className='-mx-6 -my-6 flex gap-3 overflow-x-auto px-6 py-6'>
          {games.map((game) => (
            <GameCard key={game.id} polymorphic active={selectedGameId === game.id} onClick={() => setSelectedGameId(game.id)} className='w-36 shrink-0' {...game} />
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
  </>
)
