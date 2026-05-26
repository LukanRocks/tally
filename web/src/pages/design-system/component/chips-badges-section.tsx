import { Badge, badgeVariantGroups } from '@/components/atoms/badge'
import { Chip } from '@/components/atoms/chip'

// !TODO: Add chip variants and export as variant groups like badge
export const ChipsBadgesSection = () => (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Chips & Badges</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Two shapes, one job each. <strong>Badges</strong> are rounded; they carry status and selection. <strong>Chips</strong> are squared; they carry metadata (player counts,
          times, tags).
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        {/* <p className='caption text-ink-muted'>Pill — selection & status</p>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex h-7 items-center rounded-full border border-border bg-card px-3 text-sm font-medium text-ink-primary'>Default</span>
          <span className='inline-flex h-7 items-center rounded-full border border-ink-primary bg-ink-primary px-3 text-sm font-medium text-paper-primary'>Selected</span>
          <span className='inline-flex h-7 items-center rounded-full border border-yellow-tertiary/35 bg-yellow-secondary px-3 text-sm font-medium text-ink-primary'>Soft</span>
          <span className='inline-flex h-7 items-center rounded-full border border-dashed border-border bg-transparent px-3 text-sm font-medium text-ink-muted'>+ add</span>
          <span className='inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card pr-1 pl-1.5 text-sm font-medium text-ink-primary'>
            <span
              className='inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-black/10 text-[10px] font-bold text-ink-primary'
              style={{ background: 'var(--player-a)' }}
            >
              A
            </span>
            Alyne
            <button
              aria-label='remove'
              className='ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-base leading-none text-ink-muted hover:bg-paper-secondary hover:text-ink-primary'
            >
              ×
            </button>
          </span>
        </div> */}

        <p className='caption text-ink-muted'>Chip — metadata</p>
        <div className='flex flex-wrap items-center gap-2'>
          <Chip>2–4 players</Chip>
          <Chip>~45 min</Chip>
          <Chip>strategy</Chip>
          {/* <Chip className='border-yellow-tertiary/40 bg-yellow-secondary'>★ best for 3</Chip>
          <Chip className='border-loss/30 bg-loss/12'>🔥 3 streak</Chip> */}
        </div>

        {badgeVariantGroups.map(({ label, variants }) => (
          <div key={label} className='space-y-2'>
            <p className='caption text-ink-muted'>{label}</p>
            <div className='flex flex-wrap items-center gap-2'>
              {variants.map((v) => (
                <Badge key={v} variant={v}>
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
)
