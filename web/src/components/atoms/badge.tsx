import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { type ComponentColor } from '@/lib/colors'

const badgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'border-transparent',
        outline: 'bg-transparent',
        ghost: 'border-transparent bg-transparent',
      },
      color: {
        gold: 'text-1st-place',
        silver: 'text-2nd-place',
        bronze: 'text-3rd-place',
        self: 'text-status-self',
        friend: 'text-status-friend',
        store: 'text-status-store',
        success: 'text-success',
        warning: 'text-warning',
        info: 'text-info',
        destructive: 'text-destructive',
        primary: 'text-primary',
        secondary: 'text-secondary',
      } satisfies Record<ComponentColor, string>,
    },
    compoundVariants: [
      { variant: 'default', color: 'gold', className: 'bg-1st-place/20' },
      { variant: 'default', color: 'silver', className: 'bg-2nd-place/20' },
      { variant: 'default', color: 'bronze', className: 'bg-3rd-place/20' },
      { variant: 'default', color: 'self', className: 'bg-status-self/20' },
      { variant: 'default', color: 'friend', className: 'bg-status-friend/20' },
      { variant: 'default', color: 'store', className: 'bg-status-store/20' },
      { variant: 'default', color: 'success', className: 'bg-success/20' },
      { variant: 'default', color: 'warning', className: 'bg-warning/20' },
      { variant: 'default', color: 'info', className: 'bg-info/20' },
      { variant: 'default', color: 'destructive', className: 'bg-destructive/20' },
      { variant: 'default', color: 'primary', className: 'bg-primary/20' },
      // outline border
      { variant: 'outline', color: 'gold', className: 'border-1st-place' },
      { variant: 'outline', color: 'silver', className: 'border-2nd-place' },
      { variant: 'outline', color: 'bronze', className: 'border-3rd-place' },
      { variant: 'outline', color: 'self', className: 'border-status-self' },
      { variant: 'outline', color: 'friend', className: 'border-status-friend' },
      { variant: 'outline', color: 'store', className: 'border-status-store' },
      { variant: 'outline', color: 'success', className: 'border-success' },
      { variant: 'outline', color: 'warning', className: 'border-warning' },
      { variant: 'outline', color: 'info', className: 'border-info' },
      { variant: 'outline', color: 'destructive', className: 'border-destructive' },
      { variant: 'outline', color: 'primary', className: 'border-primary' },
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
