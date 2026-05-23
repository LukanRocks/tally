import { RefreshCwIcon } from 'lucide-react'

type HttpError = Error & { code?: number }

type Props = { error?: HttpError; onRetry: () => void; retryCount?: number }

export const ErrorScreen = ({ error, onRetry, retryCount }: Props) => (
  <div className='flex min-h-screen flex-col bg-background'>
    <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-12 py-16'>
      <div className='flex flex-col'>
        <div className='eyebrow mb-10 flex items-center gap-2 text-muted-foreground'>
          <span className='relative flex size-2.5'>
            <span className='absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75' />
            <span className='relative inline-flex size-2.5 rounded-full bg-destructive' />
          </span>
          TALLY · OFFLINE
        </div>

        <h1 className='text-8xl leading-none font-black tracking-tight text-foreground'>
          Score's
          <br />
          on pause.
        </h1>
        <p className='callout mt-1 text-4xl'>— off-line.</p>

        <p className='mt-10 text-lg leading-relaxed text-foreground/70'>
          Your browser can't find Tally's backend right now. Nothing's lost. Nothing's logged either, until we're back.
        </p>

        <div className='mt-10 flex items-center gap-4'>
          <button onClick={onRetry} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-foreground transition-opacity hover:opacity-90'>
            <RefreshCwIcon className='size-4' />
            Try again
          </button>
          <p className='eyebrow ml-2 text-muted-foreground'>
            AUTO · NEXT IN <span className='monospace text-foreground'>0:04</span>
          </p>
        </div>
      </div>

      <div className='flex gap-16 border-t border-border pt-8'>
        {[
          ['STATUS', error?.code ? `${error.code} · ${error.message}` : 'unreachable'],
          ['LAST SYNC', '4m ago'],
          ['ATTEMPT', retryCount !== undefined ? `#${retryCount + 1}` : '—'],
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
