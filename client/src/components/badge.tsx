import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ds-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      // ── Form ────────────────────────────────────────────────
      variant: {
        default: 'border-transparent',
        outline: 'bg-transparent',
        ghost: 'border-transparent bg-transparent',
      },
      // ── Color ───────────────────────────────────────────────
      color: {
        // Medals
        gold: 'text-ds-rank-gold',
        silver: 'text-ds-rank-silver',
        bronze: 'text-ds-rank-bronze',
        // Player status
        own: 'text-ds-status-own',
        friend: 'text-ds-status-friend',
        rented: 'text-ds-status-rented',
        // Feedback
        success: 'text-ds-success',
        warning: 'text-ds-warning',
        info: 'text-ds-info',
        destructive: 'text-ds-destructive',
        // Neutral
        primary: 'text-ds-primary',
      },
    },
    compoundVariants: [
      // filled bg
      { variant: 'default', color: 'gold', className: 'bg-ds-rank-gold/20' },
      { variant: 'default', color: 'silver', className: 'bg-ds-rank-silver/20' },
      { variant: 'default', color: 'bronze', className: 'bg-ds-rank-bronze/20' },
      { variant: 'default', color: 'own', className: 'bg-ds-status-own/20' },
      { variant: 'default', color: 'friend', className: 'bg-ds-status-friend/20' },
      { variant: 'default', color: 'rented', className: 'bg-ds-status-rented/20' },
      { variant: 'default', color: 'success', className: 'bg-ds-success/20' },
      { variant: 'default', color: 'warning', className: 'bg-ds-warning/20' },
      { variant: 'default', color: 'info', className: 'bg-ds-info/20' },
      { variant: 'default', color: 'destructive', className: 'bg-ds-destructive/20' },
      { variant: 'default', color: 'primary', className: 'bg-ds-primary/20' },
      // outline border
      { variant: 'outline', color: 'gold', className: 'border-ds-rank-gold' },
      { variant: 'outline', color: 'silver', className: 'border-ds-rank-silver' },
      { variant: 'outline', color: 'bronze', className: 'border-ds-rank-bronze' },
      { variant: 'outline', color: 'own', className: 'border-ds-status-own' },
      { variant: 'outline', color: 'friend', className: 'border-ds-status-friend' },
      { variant: 'outline', color: 'rented', className: 'border-ds-status-rented' },
      { variant: 'outline', color: 'success', className: 'border-ds-success' },
      { variant: 'outline', color: 'warning', className: 'border-ds-warning' },
      { variant: 'outline', color: 'info', className: 'border-ds-info' },
      { variant: 'outline', color: 'destructive', className: 'border-ds-destructive' },
      { variant: 'outline', color: 'primary', className: 'border-ds-primary' },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'primary',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

export const Badge = ({ className, variant, color, asChild = false, ...props }: ComponentProps<'span'> & BadgeVariants & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'span'

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant, color }), className)} {...props} />
}
