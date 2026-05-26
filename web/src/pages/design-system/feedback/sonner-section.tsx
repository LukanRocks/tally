// import { toast } from 'sonner'

export const SonnerSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Sonner</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        Toasts in the bottom-left. Banners inline at the top of a surface. Both auto-dismiss for non-blocking news; require a tap for "you did a thing".
      </p>
    </div>

    <div className='grid grid-cols-2 gap-4'>
      <div className='flex items-center gap-3 rounded-lg bg-ink-primary px-3.5 py-3 shadow-md'>
        <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-primary text-[13px] font-bold text-ink-primary'>✓</span>
        <div className='flex flex-1 flex-col gap-0.5'>
          <span className='text-sm font-bold text-paper-primary'>Session logged.</span>
          <span className='text-xs' style={{ color: 'color-mix(in oklch, var(--paper-primary) 60%, transparent)' }}>
            Alyne · Rumikubi · 4 players
          </span>
        </div>
        <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-yellow-primary transition-colors hover:bg-white/8'>
          Undo
        </button>
      </div>

      <div className='flex items-center gap-3 rounded-lg bg-ink-primary px-3.5 py-3 shadow-md'>
        <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-loss text-[13px] font-bold text-paper-primary'>!</span>
        <div className='flex flex-1 flex-col gap-0.5'>
          <span className='text-sm font-bold text-paper-primary'>Couldn't save</span>
          <span className='text-xs' style={{ color: 'color-mix(in oklch, var(--paper-primary) 60%, transparent)' }}>
            Try again — you'll keep what you entered.
          </span>
        </div>
        <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-yellow-primary transition-colors hover:bg-white/8'>
          Retry
        </button>
      </div>
    </div>

    <div>
      <p className='caption mb-3 text-ink-muted'>Banner</p>
      <div className='flex items-center justify-between gap-4 rounded-lg border border-yellow-tertiary/35 bg-yellow-secondary px-4 py-3.5'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-bold text-ink-primary'>BG3 is due back to Joy Joy in 2 days.</span>
          <span className='text-xs text-ink-secondary'>Renew rental or mark returned.</span>
        </div>
        <button className='inline-flex h-7.5 shrink-0 cursor-pointer items-center rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:border-ink-muted hover:bg-paper-secondary'>
          Manage rental
        </button>
      </div>
    </div>

    {/* Toaster (interactive — needs sonner wired up)
      <div>
        <p className='caption mb-3 text-ink-muted'>Toaster</p>
        <div className='bg-surface-elevated flex flex-wrap gap-3 rounded-xl border border-border px-6 py-5'>
          <button className='rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground' onClick={() => toast('Default toast')}>
            Default
          </button>
          <button className='rounded-md bg-success px-3 py-1.5 text-sm text-white' onClick={() => toast.success('Success toast')}>
            Success
          </button>
          <button className='rounded-md bg-warning px-3 py-1.5 text-sm text-white' onClick={() => toast.warning('Warning toast')}>
            Warning
          </button>
          <button className='rounded-md bg-destructive px-3 py-1.5 text-sm text-white' onClick={() => toast.error('Error toast')}>
            Error
          </button>
          <button className='rounded-md bg-info px-3 py-1.5 text-sm text-white' onClick={() => toast.info('Info toast')}>
            Info
          </button>
          <button className='rounded-md bg-muted px-3 py-1.5 text-sm text-foreground' onClick={() => toast.loading('Loading…')}>
            Loading
          </button>
        </div>
      </div>
      */}
  </section>
)
