import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { type ComponentColor } from '@/lib/colors'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-card',
        ghost: 'bg-transparent',
        link: 'underline-offset-4 hover:underline',
      },
      color: {
        gold: '',
        silver: '',
        bronze: '',
        self: '',
        friend: '',
        store: '',
        success: '',
        warning: '',
        info: '',
        destructive: '',
        primary: '',
        secondary: '',
      } satisfies Record<ComponentColor, string>,
      size: {
        small: "h-7.5 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        default: 'h-9.5 gap-2 px-3.5',
        big: 'h-11.5 gap-2 px-5 text-[15px]',
        icon: 'size-9.5',
      },
    },
    compoundVariants: [
      // ── default (filled) ───────────────────────────────────────────────
      { variant: 'default', color: 'primary',     className: 'bg-yellow-primary border-yellow-tertiary text-ink-on-yellow shadow-xs hover:bg-yellow-tertiary' },
      { variant: 'default', color: 'secondary',   className: 'bg-secondary border-secondary/50 text-secondary-foreground hover:bg-secondary/80' },
      { variant: 'default', color: 'destructive',  className: 'bg-destructive/12 border-destructive/30 text-destructive hover:bg-destructive/20 hover:border-destructive/50' },
      { variant: 'default', color: 'gold',        className: 'bg-1st-place/15 border-1st-place/30 text-1st-place hover:bg-1st-place/25' },
      { variant: 'default', color: 'silver',      className: 'bg-2nd-place/15 border-2nd-place/30 text-2nd-place hover:bg-2nd-place/25' },
      { variant: 'default', color: 'bronze',      className: 'bg-3rd-place/15 border-3rd-place/30 text-3rd-place hover:bg-3rd-place/25' },
      { variant: 'default', color: 'self',        className: 'bg-status-self/15 border-status-self/30 text-status-self hover:bg-status-self/25' },
      { variant: 'default', color: 'friend',      className: 'bg-status-friend/15 border-status-friend/30 text-status-friend hover:bg-status-friend/25' },
      { variant: 'default', color: 'store',       className: 'bg-status-store/15 border-status-store/30 text-status-store hover:bg-status-store/25' },
      { variant: 'default', color: 'success',     className: 'bg-success/12 border-success/30 text-success hover:bg-success/20 hover:border-success/50' },
      { variant: 'default', color: 'warning',     className: 'bg-warning/12 border-warning/30 text-warning hover:bg-warning/20 hover:border-warning/50' },
      { variant: 'default', color: 'info',        className: 'bg-info/12 border-info/30 text-info hover:bg-info/20 hover:border-info/50' },

      // ── outline ────────────────────────────────────────────────────────
      { variant: 'outline', color: 'primary',     className: 'border-yellow-primary text-primary hover:border-yellow-tertiary hover:bg-yellow-secondary/40' },
      { variant: 'outline', color: 'secondary',   className: 'border-border text-ink-secondary hover:border-ink-muted hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'outline', color: 'destructive',  className: 'border-destructive/35 text-destructive hover:border-destructive hover:bg-destructive/10' },
      { variant: 'outline', color: 'gold',        className: 'border-1st-place/40 text-1st-place hover:border-1st-place hover:bg-1st-place/10' },
      { variant: 'outline', color: 'silver',      className: 'border-2nd-place/40 text-2nd-place hover:border-2nd-place hover:bg-2nd-place/10' },
      { variant: 'outline', color: 'bronze',      className: 'border-3rd-place/40 text-3rd-place hover:border-3rd-place hover:bg-3rd-place/10' },
      { variant: 'outline', color: 'self',        className: 'border-status-self/40 text-status-self hover:border-status-self hover:bg-status-self/10' },
      { variant: 'outline', color: 'friend',      className: 'border-status-friend/40 text-status-friend hover:border-status-friend hover:bg-status-friend/10' },
      { variant: 'outline', color: 'store',       className: 'border-status-store/40 text-status-store hover:border-status-store hover:bg-status-store/10' },
      { variant: 'outline', color: 'success',     className: 'border-success/40 text-success hover:border-success hover:bg-success/10' },
      { variant: 'outline', color: 'warning',     className: 'border-warning/40 text-warning hover:border-warning hover:bg-warning/10' },
      { variant: 'outline', color: 'info',        className: 'border-info/40 text-info hover:border-info hover:bg-info/10' },

      // ── ghost ──────────────────────────────────────────────────────────
      { variant: 'ghost', color: 'primary',     className: 'text-primary hover:bg-yellow-primary/10 hover:text-ink-primary' },
      { variant: 'ghost', color: 'secondary',   className: 'text-ink-secondary hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'ghost', color: 'destructive',  className: 'text-destructive hover:bg-destructive/10' },
      { variant: 'ghost', color: 'gold',        className: 'text-1st-place hover:bg-1st-place/10' },
      { variant: 'ghost', color: 'silver',      className: 'text-2nd-place hover:bg-2nd-place/10' },
      { variant: 'ghost', color: 'bronze',      className: 'text-3rd-place hover:bg-3rd-place/10' },
      { variant: 'ghost', color: 'self',        className: 'text-status-self hover:bg-status-self/10' },
      { variant: 'ghost', color: 'friend',      className: 'text-status-friend hover:bg-status-friend/10' },
      { variant: 'ghost', color: 'store',       className: 'text-status-store hover:bg-status-store/10' },
      { variant: 'ghost', color: 'success',     className: 'text-success hover:bg-success/10' },
      { variant: 'ghost', color: 'warning',     className: 'text-warning hover:bg-warning/10' },
      { variant: 'ghost', color: 'info',        className: 'text-info hover:bg-info/10' },

      // ── link ───────────────────────────────────────────────────────────
      { variant: 'link', color: 'primary',     className: 'text-primary' },
      { variant: 'link', color: 'secondary',   className: 'text-ink-secondary' },
      { variant: 'link', color: 'destructive',  className: 'text-destructive' },
      { variant: 'link', color: 'gold',        className: 'text-1st-place' },
      { variant: 'link', color: 'silver',      className: 'text-2nd-place' },
      { variant: 'link', color: 'bronze',      className: 'text-3rd-place' },
      { variant: 'link', color: 'self',        className: 'text-status-self' },
      { variant: 'link', color: 'friend',      className: 'text-status-friend' },
      { variant: 'link', color: 'store',       className: 'text-status-store' },
      { variant: 'link', color: 'success',     className: 'text-success' },
      { variant: 'link', color: 'warning',     className: 'text-warning' },
      { variant: 'link', color: 'info',        className: 'text-info' },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'primary',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

export const Button = ({
  className,
  variant,
  color,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & ButtonVariants & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot='button' className={cn(buttonVariants({ variant, color, size }), className)} {...props} />
}
