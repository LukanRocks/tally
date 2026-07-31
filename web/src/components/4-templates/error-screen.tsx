import { ExternalLinkIcon, RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { useAutoRetry } from '@/hooks/useAutoRetry'
import { useTimeAgo } from '@/hooks/useTimeAgo'
import { PulseDot } from '@/components/1-atoms/pulse-dot'
import { Button } from '@/components/1-atoms/button'

import type { HttpError } from '@/lib/http-transport/helpers'

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

  // The server answered and told us what is wrong, so this is not an outage —
  // it is a configuration Tally cannot start against. Retrying a typo in a
  // compose file never succeeds, so the countdown is noise here.
  const misconfigured = error?.state === 'MISCONFIGURED'

  return (
    <div className='flex min-h-screen flex-col bg-paper-primary'>
      <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-12 py-16'>
        <div className='flex flex-col'>
          <div className='mb-10 flex items-center gap-2 caption text-ink-muted'>
            <PulseDot color='destructive' />
            TALLY · {misconfigured ? 'NOT CONFIGURED' : 'OFFLINE'}
          </div>

          <h1 className='text-8xl leading-none font-black tracking-tight text-ink-primary'>
            Somebody
            <br />
            knocked
            <br />
            the table.
          </h1>
          <p className='mt-1 callout text-4xl'>{tagline}</p>

          <p className='mt-10 text-lg leading-relaxed text-ink-primary/70'>
            {error?.problem ?? "Your browser can see the table. It just can't sit down at it. The Tally server. We meant server."}
          </p>

          <div className='mt-10 flex items-center gap-4'>
            <Button size='big' onClick={fire}>
              <RefreshCwIcon />
              {misconfigured ? 'Check again' : 'Roll again'}
            </Button>
            {error?.docsUrl ? (
              <a
                href={error.docsUrl}
                target='_blank'
                rel='noreferrer'
                className='ml-2 inline-flex items-center gap-1.5 caption text-ink-secondary underline-offset-4 transition-opacity hover:underline hover:opacity-70'
              >
                READ THE DOCS
                <ExternalLinkIcon className='size-3.5' />
              </a>
            ) : null}
            {!misconfigured && (
              <button onClick={toggle} className='ml-2 caption text-ink-muted transition-opacity hover:opacity-70'>
                {enabled ? (
                  <>
                    AUTO · NEXT IN <span className='monospace text-ink-primary'>{formatted}</span>
                  </>
                ) : (
                  'AUTO · PAUSED'
                )}
              </button>
            )}
          </div>
        </div>

        <div className='flex items-center justify-center gap-16 border-t border-paper-muted pt-8'>
          {[
            ['NAME', error?.name],
            // When the problem is spelled out above, repeating it here is noise —
            // the code alone is what someone would quote in a bug report.
            ['STATUS', error?.code ? (error.problem ? `${error.code}` : `${error.code} · ${error.message}`) : 'unreachable'],
            ['LAST ATTEMPT', timeAgo],
            // ['ATTEMPT', `#${retryCount + 1}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className='mb-1 caption text-ink-muted'>{label}</p>
              <p className='monospace text-sm text-ink-primary'>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
