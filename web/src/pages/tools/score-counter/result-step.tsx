import { Crown, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Avatar } from '@/components/atoms/avatar'
import { type Player } from '@/lib/http-transport/api'
import { type RankedResult, type ScoringDirection } from '@/hooks/useScoreCounter'
import { getPlayerColor } from '@/lib/deterministic-picker'

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

export function ResultStep({ rankedResults, players, scoringDirection, onNewCount, onCreateSession, onDone }: ResultStepProps) {
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
    <>
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
    </>
  )
}
