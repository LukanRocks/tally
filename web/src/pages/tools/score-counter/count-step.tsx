import { useState, useRef } from 'react'
import { Delete, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/1-atoms/button'
import { Avatar } from '@/components/1-atoms/avatar'
import { type Player } from '@/lib/http-transport/api'
import { type PlayerScore } from './types'
import { getPlayerColor } from '@/lib/deterministic-picker'

interface CountStepProps {
  selectedPlayers: Player[]
  scores: Record<number, PlayerScore>
  onScoresChange: (updater: (prev: Record<number, PlayerScore>) => Record<number, PlayerScore>) => void
}

const QUICK_ADDS_POS = [1, 5, 10]
const QUICK_ADDS_NEG = [-10, -5, -1]
const NUMPAD_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['±', '0', '⌫'],
]

const addEntry = (score: PlayerScore, value: number): PlayerScore => {
  const entries = [...score.entries, { value }]
  return { entries, total: entries.reduce((sum, e) => sum + e.value, 0) }
}

const removeLastEntry = (score: PlayerScore): PlayerScore => {
  const entries = score.entries.slice(0, -1)
  return { entries, total: entries.reduce((sum, e) => sum + e.value, 0) }
}

export function CountStep({ selectedPlayers, scores, onScoresChange }: CountStepProps) {
  const [playerOrder, setPlayerOrder] = useState<number[]>(selectedPlayers.map((p) => p.id))
  const [activePlayerId, setActivePlayerId] = useState<number>(selectedPlayers[0].id)
  const [inputBuffer, setInputBuffer] = useState('')

  const activePlayer = selectedPlayers.find((p) => p.id === activePlayerId)
  const activeScore = scores[activePlayerId]
  const inactivePlayers = playerOrder.filter((id) => id !== activePlayerId)

  const parsedBuffer = parseInt(inputBuffer, 10)
  const canCommitBuffer = inputBuffer !== '' && inputBuffer !== '-' && !isNaN(parsedBuffer) && parsedBuffer !== 0
  const bufferDisplay = inputBuffer === '' ? '0' : inputBuffer.startsWith('-') ? '−' + inputBuffer.slice(1) : inputBuffer

  const lastQuickAddTime = useRef(0)

  const handleSetActivePlayer = (id: number) => {
    setPlayerOrder((order) => [...order.filter((pid) => pid !== activePlayerId), activePlayerId])
    setActivePlayerId(id)
    setInputBuffer('')
  }

  const applyQuickAdd = (value: number) => {
    const now = Date.now()
    if (now - lastQuickAddTime.current < 100) return
    lastQuickAddTime.current = now
    onScoresChange((prev) => ({ ...prev, [activePlayerId]: addEntry(prev[activePlayerId] ?? { entries: [], total: 0 }, value) }))
  }

  const appendDigit = (digit: string) => {
    setInputBuffer((buf) => {
      if (buf === '' || buf === '0') return digit
      if (buf === '-') return '-' + digit
      return buf + digit
    })
  }

  const toggleSign = () => {
    setInputBuffer((buf) => {
      if (!buf || buf === '0') return buf
      return buf.startsWith('-') ? buf.slice(1) : '-' + buf
    })
  }

  const backspace = () => setInputBuffer((buf) => buf.slice(0, -1))

  const commitBuffer = () => {
    const value = parseInt(inputBuffer, 10)
    if (!inputBuffer || inputBuffer === '-' || isNaN(value) || value === 0) return
    onScoresChange((prev) => ({ ...prev, [activePlayerId]: addEntry(prev[activePlayerId] ?? { entries: [], total: 0 }, value) }))
    setInputBuffer('')
  }

  const undoLast = () => {
    onScoresChange((prev) => {
      const score = prev[activePlayerId] ?? { entries: [], total: 0 }
      if (!score.entries.length) return prev
      return { ...prev, [activePlayerId]: removeLastEntry(score) }
    })
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                  </div>
                  <span className='text-xs text-ink-muted'>{activeScore?.entries.length ?? 0} entries</span>
                </div>
                <span className='ml-auto text-3xl font-bold text-ink-primary tabular-nums'>{activeScore?.total ?? 0}</span>
              </div>

              {/* Entries */}
              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='caption text-xs text-ink-muted'>Entries</span>
                  {(activeScore?.entries.length ?? 0) > 0 && (
                    <button onClick={undoLast} className='text-xs font-medium text-ink-secondary underline underline-offset-2'>
                      Undo last
                    </button>
                  )}
                </div>

                {(activeScore?.entries.length ?? 0) === 0 ? (
                  <p className='text-xs text-ink-muted italic'>No points yet — tap a number or quick-add to start</p>
                ) : (
                  <div className='grid gap-1.5' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(4rem, 1fr))' }}>
                    {activeScore.entries.map((entry, i) => {
                      const entryClasses = cn('rounded-lg px-2 py-1 text-center font-mono text-xs font-medium', entry.value > 0 ? 'bg-win/20 text-win' : 'bg-loss/20 text-loss')
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

        {/* Mobile: horizontal scrollable player strip */}
        {inactivePlayers.length > 0 && (
          <div className='flex scrollbar-none gap-2 overflow-x-auto pb-1 md:hidden'>
            {inactivePlayers.map((id) => {
              const player = selectedPlayers.find((p) => p.id === id)
              if (!player) return null
              const score = scores[id]
              return (
                <button
                  key={id}
                  className='flex shrink-0 items-center gap-2 rounded-xl border border-border bg-paper-secondary px-3 py-2 transition-colors hover:bg-paper-muted'
                  onClick={() => handleSetActivePlayer(id)}
                >
                  <Avatar id={player.id} name={player.name} avatar_path={player.avatar_path} size='sm' />
                  <span className='text-sm font-medium text-ink-primary'>{player.name}</span>
                  <span className='text-sm font-bold text-ink-primary tabular-nums'>{score?.total ?? 0}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Desktop: vertical inactive player rows */}
        <div className='hidden md:flex md:flex-col md:gap-3'>
          {inactivePlayers.map((id) => {
            const player = selectedPlayers.find((p) => p.id === id)
            if (!player) return null
            const score = scores[id]
            return (
              <button
                key={id}
                className='flex items-center gap-3 rounded-xl border border-border bg-paper-secondary px-4 py-3 transition-colors hover:bg-paper-muted'
                onClick={() => handleSetActivePlayer(id)}
              >
                <Avatar id={player.id} name={player.name} avatar_path={player.avatar_path} size='sm' />
                <span className='flex-1 text-left text-sm font-medium text-ink-primary'>{player.name}</span>
                <span className='text-xs text-ink-muted'>{score?.entries.length ?? 0} entries</span>
                <span className='w-12 text-right text-base font-bold text-ink-primary tabular-nums'>{score?.total ?? 0}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input panel */}
      <div className='flex flex-col gap-4'>
        {/* Quick add */}
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap gap-2'>
            {QUICK_ADDS_POS.map((value) => (
              <Button key={value} className='flex-1' variant='outline' color='secondary' onClick={() => applyQuickAdd(value)}>
                +{value}
              </Button>
            ))}
            {QUICK_ADDS_NEG.map((value) => (
              <Button key={value} className='flex-1' variant='outline' color='destructive' onClick={() => applyQuickAdd(value)}>
                {value}
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
              const handleKey = () => {
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
            <Plus />
            Add points
          </Button>
        </div>
      </div>
    </div>
  )
}
