export const BrandSection = () => (
  <section className='space-y-6'>
    <div>
      <span className='eyebrow text-ink-muted'>01 — Foundations</span>
      <h2 className='mt-1 text-2xl font-bold'>Brand</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        Tally is a board-game session tracker. The voice is <strong>warm, sharp, a little smug after a win</strong>. Surfaces are calm and paper-coloured; the yellow only shows up
        where something is happening.
      </p>
    </div>

    <div className='grid grid-cols-2 gap-4'>
      <div className='rounded-xl border border-border bg-card p-5'>
        <p className='eyebrow mb-4 text-ink-muted'>Primary lockup</p>
        <div className='flex items-center gap-4 py-4'>
          <img src='/logo-ink.svg' width={80} height={80} className='hidden rounded-xl dark:block' />
          <img src='/logo-paper.svg' width={80} height={80} className='rounded-xl dark:hidden' />
          <span className='text-5xl font-extrabold tracking-tight'>Tally</span>
        </div>
        <p className='text-xs text-ink-muted'>Four bars + a yellow slash. Reads as a scoreboard.</p>
      </div>

      <div className='rounded-xl border border-border bg-card p-5'>
        <p className='eyebrow mb-4 text-ink-muted'>Voice — three rules</p>
        <ol className='list-decimal space-y-2 pl-5 text-sm text-ink-secondary'>
          <li>
            <strong>Short and crisp.</strong> "Log a session", not "Record gameplay activity".
          </li>
          <li>
            <strong>Stats with a wink.</strong> "Alyne wins again" beats "Alyne: 4 victories".
          </li>
          <li>
            <strong>Verbs, not nouns.</strong> Buttons say <span className='font-semibold text-yellow-tertiary'>Play tonight</span>,{' '}
            <span className='font-semibold text-yellow-tertiary'>Log</span>, <span className='font-semibold text-yellow-tertiary'>Add player</span> — never "Submit".
          </li>
        </ol>
      </div>
    </div>

    <div className='grid grid-cols-3 gap-4'>
      <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
        <img src='/logo-ink.svg' className='h-24 w-24 rounded-xl' />
        <p className='eyebrow text-center text-ink-muted'>Ink ground · default</p>
      </div>

      <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
        <img src='/logo-yellow.svg' className='h-24 w-24 rounded-xl' />
        <p className='eyebrow text-center text-ink-muted'>Yellow ground · home tile</p>
      </div>

      <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
        <img src='/logo-paper.svg' className='h-24 w-24 rounded-xl' />
        <p className='eyebrow text-center text-ink-muted'>Mono · footer / emboss</p>
      </div>
    </div>
  </section>
)
