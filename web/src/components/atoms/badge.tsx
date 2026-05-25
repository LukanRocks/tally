import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 font-mono text-xs font-medium whitespace-nowrap uppercase transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        owned: 'border-status-owned/60 bg-status-owned text-ink-on-yellow',
        borrowed: 'border-status-borrowed/60 bg-status-borrowed text-ink-on-yellow',
        rented: 'border-status-rented/60 bg-status-rented text-ink-on-yellow',

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

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const badgeVariantGroups: { label: string; variants: BadgeVariant[] }[] = [
  { label: 'Status badge — ownership', variants: ['owned', 'borrowed', 'rented'] },
  { label: 'Medals badge — leaderboard', variants: ['gold', 'silver', 'bronze'] },
  { label: 'Results badge — session', variants: ['win', 'loss', 'tie'] },
]

export const Badge = ({ className, variant, asChild = false, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'span'
  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />
}
