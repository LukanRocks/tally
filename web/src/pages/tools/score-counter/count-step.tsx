import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Avatar } from '@/components/atoms/avatar'
import { type Player } from '@/lib/http-transport/api'
import { type PlayerScore } from '@/hooks/useScoreCounter'
import { getPlayerColor } from '@/lib/deterministic-picker'

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

export function CountStep({
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
