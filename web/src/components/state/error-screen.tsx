import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { useAutoRetry } from '@/hooks/useAutoRetry'
import { useTimeAgo } from '@/hooks/useTimeAgo'
import { PulseDot } from '@/components/atoms/pulse-dot'
import { Button } from '@/components/atoms/button'

type HttpError = Error & { code?: number }

type Props = { error?: HttpError; onRetry: () => void }

const TAGLINES = [
  '— pieces everywhere.',
  "— we're picking them up.",
  '— tiles are scattered.',
  "— board's on the floor.",
  "— game's on hold.",
  "— nobody's fault, probably.",
  '— happens to everyone.',
  "— we're resetting the board.",
  '— blame the dog.',
  '— deep breath.',
  '— give us a moment.',
  "— we're sorting it out.",
  '— mid-game chaos.',
  '— hang tight.',
  "— we'll pick it back up.",
  '— patience, player.',
  '— my bad.',
  '— ops.',
  '— classic.',
  '— again...',
  '— sorry.',
  "— we've had worse.",
]

export const ErrorScreen = ({ error, onRetry }: Props) => {
  const [since] = useState(() => new Date())
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])
  const timeAgo = useTimeAgo(since)
  const { enabled, toggle, formatted, fire } = useAutoRetry(onRetry)

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-12 py-16'>
        <div className='flex flex-col'>
          <div className='eyebrow mb-10 flex items-center gap-2 text-muted-foreground'>
            <PulseDot color='destructive' />
            TALLY · OFFLINE
          </div>

          <h1 className='text-8xl leading-none font-black tracking-tight text-foreground'>
            Somebody
            <br />
            knocked
            <br />
            the table.
          </h1>
          <p className='callout mt-1 text-4xl'>{tagline}</p>

          <p className='mt-10 text-lg leading-relaxed text-foreground/70'>Your browser can see the table. It just can't sit down at it. The Tally server. We meant server.</p>

          <div className='mt-10 flex items-center gap-4'>
            <Button size='big' onClick={fire}>
              <RefreshCwIcon />
              Roll again
            </Button>
            <button onClick={toggle} className='eyebrow ml-2 text-ink-muted transition-opacity hover:opacity-70'>
              {enabled ? (
                <>
                  AUTO · NEXT IN <span className='monospace text-ink-primary'>{formatted}</span>
                </>
              ) : (
                'AUTO · PAUSED'
              )}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-center gap-16 border-t border-border pt-8'>
          {[
            ['NAME', error?.name],
            ['STATUS', error?.code ? `${error.code} · ${error.message}` : 'unreachable'],
            ['LAST ATTEMPT', timeAgo],
            // ['ATTEMPT', `#${retryCount + 1}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className='eyebrow mb-1 text-muted-foreground'>{label}</p>
              <p className='monospace text-sm text-foreground'>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
