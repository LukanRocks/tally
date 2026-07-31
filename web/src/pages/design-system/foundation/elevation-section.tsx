import { cn } from '@/lib/utils'

export const ElevationSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Elevation</h2>
      <p className='mt-1 text-sm text-ink-secondary'>Shadows stay soft and warm. Reserve the hard "ink stamp" shadow for moments of personality — never for default chrome.</p>
    </div>

    <div className='grid grid-cols-5 gap-3'>
      {(
        [
          { name: 'xs', desc: 'borders with a hint of depth', cls: 'shadow-xs', stamp: false },
          { name: 'sm', desc: 'resting cards', cls: 'shadow-sm', stamp: false },
          { name: 'md', desc: 'hover, popovers', cls: 'shadow-md', stamp: false },
          { name: 'lg', desc: 'dialogs, sheets', cls: 'shadow-lg', stamp: false },
          { name: 'stamp', desc: 'signature moment · use rarely', cls: 'shadow-stamp', stamp: true },
        ] as const
      ).map(({ name, desc, cls, stamp }) => (
        <div key={name} className={cn('flex min-h-32 flex-col gap-2 rounded-xl bg-paper-primary p-4', cls, stamp ? 'border-[1.5px] border-ink-primary' : 'border border-paper-muted')}>
          <span className='text-sm font-bold text-ink-primary'>{name}</span>
          <span className='mt-auto text-[11px] text-ink-muted'>{desc}</span>
        </div>
      ))}
    </div>
  </section>
)
