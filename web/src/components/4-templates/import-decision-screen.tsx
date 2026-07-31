import { ArrowRightIcon, CheckIcon, DatabaseIcon, ExternalLinkIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { PulseDot } from '@/components/1-atoms/pulse-dot'
import { Button } from '@/components/1-atoms/button'

import type { DbStatus, ImportResult } from '@/lib/http-transport/private/system'

type Props = {
  status: DbStatus
  onImport: () => Promise<ImportResult>
  /** Called once the user is finished with this screen, to re-enter the app. */
  onDone: () => void
}

/** Tables worth naming. The import also copies bgg_games and settings, which mean nothing to a player. */
const HEADLINE_TABLES = ['games', 'players', 'sessions'] as const

export const ImportDecisionScreen = ({ status, onImport, onDone }: Props) => {
  const [phase, setPhase] = useState<'idle' | 'importing' | 'done'>('idle')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  // The 503 body carries a one-line `problem` for API clients. This screen has
  // room to explain properly, so it writes its own copy rather than echoing it.
  const counts = status.source
  const importing = phase === 'importing'

  const runImport = async () => {
    setPhase('importing')
    setFailure(null)

    try {
      setResult(await onImport())
      setPhase('done')
    } catch (error) {
      // The server rolled the transaction back, so both databases are exactly as
      // they were. Say what broke and leave the button live to try again.
      setFailure(error instanceof Error ? error.message : 'The import failed for an unknown reason.')
      setPhase('idle')
    }
  }

  if (phase === 'done' && result) {
    return <ImportComplete result={result} onDone={onDone} />
  }

  return (
    <div className='flex min-h-screen flex-col bg-paper-primary'>
      <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-12 py-16'>
        <div className='flex flex-col'>
          <div className='mb-10 flex items-center gap-2 caption text-ink-muted'>
            <PulseDot color='warning' />
            TALLY · MIGRATION PENDING
          </div>

          <h1 className='text-8xl leading-none font-black tracking-tight text-ink-primary'>
            Your data
            <br />
            is in the
            <br />
            other box.
          </h1>
          <p className='mt-1 callout text-4xl'>— shall we move it?</p>

          <p className='mt-10 text-lg leading-relaxed text-ink-secondary'>
            Tally is now configured for PostgreSQL, but that database is empty — your collection is still in the SQLite file it used before. Nothing is being served until you
            decide what happens to it.
          </p>

          {counts && (
            <div className='mt-10 flex items-center gap-16'>
              {HEADLINE_TABLES.map((table) => (
                <div key={table}>
                  <p className='monospace text-4xl text-ink-primary'>{counts[table]}</p>
                  <p className='mt-1 caption text-ink-muted'>{table}</p>
                </div>
              ))}
            </div>
          )}

          {failure && (
            <p role='alert' className='mt-10 border-l-2 border-destructive pl-4 text-sm leading-relaxed text-destructive'>
              {failure}
            </p>
          )}

          <div className='mt-10 flex items-center gap-4'>
            <Button size='big' onClick={runImport} disabled={importing}>
              {importing ? <Loader2Icon className='animate-spin' /> : <DatabaseIcon />}
              {importing ? 'Importing' : failure ? 'Try again' : 'Import my data'}
            </Button>
            {status.docsUrl && (
              <a
                href={status.docsUrl}
                target='_blank'
                rel='noreferrer'
                className='ml-2 inline-flex items-center gap-1.5 caption text-ink-secondary underline-offset-4 transition-opacity hover:underline hover:opacity-70'
              >
                READ THE DOCS
                <ExternalLinkIcon className='size-3.5' />
              </a>
            )}
          </div>

          <p className='mt-4 text-sm leading-relaxed text-ink-muted'>
            {importing
              ? 'Copying rows now. This runs as a single transaction, so it either finishes completely or changes nothing.'
              : 'Every id is preserved, and the original SQLite file is archived rather than deleted.'}
          </p>
        </div>

        <div className='border-t border-paper-muted pt-8'>
          <p className='mb-2 caption text-ink-muted'>PREFER TO STAY ON SQLITE?</p>
          <p className='text-sm leading-relaxed text-ink-secondary'>
            Remove the database variables from your compose file and restart. Your data has not been touched, and Tally will pick it up exactly as it was.
          </p>
        </div>
      </div>
    </div>
  )
}

const ImportComplete = ({ result, onDone }: { result: ImportResult; onDone: () => void }) => (
  <div className='flex min-h-screen flex-col bg-paper-primary'>
    <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-12 py-16'>
      <div className='flex flex-col'>
        <div className='mb-10 flex items-center gap-2 caption text-ink-muted'>
          <PulseDot color='success' pulsing={false} />
          TALLY · MIGRATION COMPLETE
        </div>

        <h1 className='text-8xl leading-none font-black tracking-tight text-ink-primary'>
          Moved.
          <br />
          Every
          <br />
          piece.
        </h1>
        <p className='mt-1 callout text-4xl'>— nothing left behind.</p>

        <div className='mt-10 flex items-center gap-16'>
          {HEADLINE_TABLES.map((table) => (
            <div key={table}>
              <p className='monospace text-4xl text-ink-primary'>{result.imported[table] ?? 0}</p>
              <p className='mt-1 caption text-ink-muted'>{table}</p>
            </div>
          ))}
        </div>

        <div className='mt-10'>
          <Button size='big' onClick={onDone}>
            <CheckIcon />
            Start playing
            <ArrowRightIcon />
          </Button>
        </div>
      </div>

      <div className='border-t border-paper-muted pt-8'>
        <p className='mb-2 caption text-ink-muted'>YOUR BACKUP</p>
        <p className='text-sm leading-relaxed text-ink-secondary'>The old database was archived, not deleted. Keep it until you are happy with the migration.</p>
        <p className='mt-2 monospace text-sm break-all text-ink-primary'>{result.archivedTo}</p>
      </div>
    </div>
  </div>
)
