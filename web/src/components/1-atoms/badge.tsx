import { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const BADGE_VARIANTS_CONFIG = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 font-mono text-xs font-medium whitespace-nowrap uppercase transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        owned: 'border-owned/60 bg-owned text-ink-on-yellow',
        borrowed: 'border-borrowed/60 bg-borrowed text-ink-on-yellow',
        rented: 'border-rented/60 bg-rented text-ink-on-yellow',

        gold: 'border-1st-place bg-1st-place/20 text-1st-place',
        silver: 'border-2nd-place bg-2nd-place/20 text-2nd-place',
        bronze: 'border-3rd-place bg-3rd-place/20 text-3rd-place',

        win: 'border-transparent bg-win/20 text-win',
        loss: 'border-transparent bg-loss/20 text-loss',
        tie: 'border-transparent bg-tie/20 text-tie',
      },
    },
    defaultVariants: {
      variant: 'owned',
    },
  },
)

export type BADGE_VARIANTS_PROPS = VariantProps<typeof BADGE_VARIANTS_CONFIG>

export type BADGE_VARIANT = NonNullable<BADGE_VARIANTS_PROPS['variant']>
export const BADGE_VARIANTS: BADGE_VARIANT[] = ['owned', 'borrowed', 'rented', 'gold', 'silver', 'bronze', 'win', 'loss', 'tie']

export const BADGE_VARIANT_GROUPS: { label: string; variants: BADGE_VARIANT[] }[] = [
  { label: 'Status badge — ownership', variants: ['owned', 'borrowed', 'rented'] },
  { label: 'Medals badge — leaderboard', variants: ['gold', 'silver', 'bronze'] },
  { label: 'Results badge — session', variants: ['win', 'loss', 'tie'] },
]

export type BadgeProps = ComponentProps<'span'> & BADGE_VARIANTS_PROPS & { polymorphic?: boolean }

export const Badge = ({ variant, className, polymorphic = false, ...props }: BadgeProps) => {
  const Component = polymorphic ? Slot.Root : 'span'
  const classes = cn(BADGE_VARIANTS_CONFIG({ variant }), className)

  return <Component data-slot='badge' data-variant={variant} className={classes} {...props} />
}
