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
        win: '',
        loss: '',
        tie: '',
        owned: '',
        borrowed: '',
        rented: '',
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
      { variant: 'default', color: 'primary', className: 'border-yellow-tertiary bg-yellow-primary text-ink-on-yellow shadow-xs hover:bg-yellow-tertiary' },
      { variant: 'default', color: 'secondary', className: 'border-secondary/50 bg-secondary text-secondary-foreground hover:bg-secondary/80' },
      { variant: 'default', color: 'destructive', className: 'border-destructive/30 bg-destructive/12 text-destructive hover:border-destructive/50 hover:bg-destructive/20' },
      { variant: 'default', color: 'gold', className: 'border-1st-place/30 bg-1st-place/15 text-1st-place hover:bg-1st-place/25' },
      { variant: 'default', color: 'silver', className: 'border-2nd-place/30 bg-2nd-place/15 text-2nd-place hover:bg-2nd-place/25' },
      { variant: 'default', color: 'bronze', className: 'border-3rd-place/30 bg-3rd-place/15 text-3rd-place hover:bg-3rd-place/25' },
      { variant: 'default', color: 'win', className: 'border-win/30 bg-win/12 text-win hover:border-win/50 hover:bg-win/20' },
      { variant: 'default', color: 'loss', className: 'border-loss/30 bg-loss/12 text-loss hover:border-loss/50 hover:bg-loss/20' },
      { variant: 'default', color: 'tie', className: 'border-tie/30 bg-tie/12 text-tie hover:border-tie/50 hover:bg-tie/20' },
      { variant: 'default', color: 'owned', className: 'border-owned/30 bg-owned/15 text-owned hover:bg-owned/25' },
      { variant: 'default', color: 'borrowed', className: 'border-borrowed/30 bg-borrowed/15 text-borrowed hover:bg-borrowed/25' },
      { variant: 'default', color: 'rented', className: 'border-rented/30 bg-rented/15 text-rented hover:bg-rented/25' },
      { variant: 'default', color: 'success', className: 'border-success/30 bg-success/12 text-success hover:border-success/50 hover:bg-success/20' },
      { variant: 'default', color: 'warning', className: 'border-warning/30 bg-warning/12 text-warning hover:border-warning/50 hover:bg-warning/20' },
      { variant: 'default', color: 'info', className: 'border-info/30 bg-info/12 text-info hover:border-info/50 hover:bg-info/20' },

      // ── outline ────────────────────────────────────────────────────────
      { variant: 'outline', color: 'primary', className: 'border-yellow-primary text-primary hover:border-yellow-tertiary hover:bg-yellow-secondary/40' },
      { variant: 'outline', color: 'secondary', className: 'border-border text-ink-secondary hover:border-ink-muted hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'outline', color: 'destructive', className: 'border-destructive/35 text-destructive hover:border-destructive hover:bg-destructive/10' },
      { variant: 'outline', color: 'gold', className: 'border-1st-place/40 text-1st-place hover:border-1st-place hover:bg-1st-place/10' },
      { variant: 'outline', color: 'silver', className: 'border-2nd-place/40 text-2nd-place hover:border-2nd-place hover:bg-2nd-place/10' },
      { variant: 'outline', color: 'bronze', className: 'border-3rd-place/40 text-3rd-place hover:border-3rd-place hover:bg-3rd-place/10' },
      { variant: 'outline', color: 'win', className: 'border-win/40 text-win hover:border-win hover:bg-win/10' },
      { variant: 'outline', color: 'loss', className: 'border-loss/40 text-loss hover:border-loss hover:bg-loss/10' },
      { variant: 'outline', color: 'tie', className: 'border-tie/40 text-tie hover:border-tie hover:bg-tie/10' },
      { variant: 'outline', color: 'owned', className: 'border-owned/40 text-owned hover:border-owned hover:bg-owned/10' },
      { variant: 'outline', color: 'borrowed', className: 'border-borrowed/40 text-borrowed hover:border-borrowed hover:bg-borrowed/10' },
      { variant: 'outline', color: 'rented', className: 'border-rented/40 text-rented hover:border-rented hover:bg-rented/10' },
      { variant: 'outline', color: 'success', className: 'border-success/40 text-success hover:border-success hover:bg-success/10' },
      { variant: 'outline', color: 'warning', className: 'border-warning/40 text-warning hover:border-warning hover:bg-warning/10' },
      { variant: 'outline', color: 'info', className: 'border-info/40 text-info hover:border-info hover:bg-info/10' },

      // ── ghost ──────────────────────────────────────────────────────────
      { variant: 'ghost', color: 'primary', className: 'text-primary hover:bg-yellow-primary/10 hover:text-ink-primary' },
      { variant: 'ghost', color: 'secondary', className: 'text-ink-secondary hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'ghost', color: 'destructive', className: 'text-destructive hover:bg-destructive/10' },
      { variant: 'ghost', color: 'gold', className: 'text-1st-place hover:bg-1st-place/10' },
      { variant: 'ghost', color: 'silver', className: 'text-2nd-place hover:bg-2nd-place/10' },
      { variant: 'ghost', color: 'bronze', className: 'text-3rd-place hover:bg-3rd-place/10' },
      { variant: 'ghost', color: 'win', className: 'text-win hover:bg-win/10' },
      { variant: 'ghost', color: 'loss', className: 'text-loss hover:bg-loss/10' },
      { variant: 'ghost', color: 'tie', className: 'text-tie hover:bg-tie/10' },
      { variant: 'ghost', color: 'owned', className: 'text-owned hover:bg-owned/10' },
      { variant: 'ghost', color: 'borrowed', className: 'text-borrowed hover:bg-borrowed/10' },
      { variant: 'ghost', color: 'rented', className: 'text-rented hover:bg-rented/10' },
      { variant: 'ghost', color: 'success', className: 'text-success hover:bg-success/10' },
      { variant: 'ghost', color: 'warning', className: 'text-warning hover:bg-warning/10' },
      { variant: 'ghost', color: 'info', className: 'text-info hover:bg-info/10' },

      // ── link ───────────────────────────────────────────────────────────
      { variant: 'link', color: 'primary', className: 'text-primary' },
      { variant: 'link', color: 'secondary', className: 'text-ink-secondary' },
      { variant: 'link', color: 'destructive', className: 'text-destructive' },
      { variant: 'link', color: 'gold', className: 'text-1st-place' },
      { variant: 'link', color: 'silver', className: 'text-2nd-place' },
      { variant: 'link', color: 'bronze', className: 'text-3rd-place' },
      { variant: 'link', color: 'win', className: 'text-win' },
      { variant: 'link', color: 'loss', className: 'text-loss' },
      { variant: 'link', color: 'tie', className: 'text-tie' },
      { variant: 'link', color: 'owned', className: 'text-owned' },
      { variant: 'link', color: 'borrowed', className: 'text-borrowed' },
      { variant: 'link', color: 'rented', className: 'text-rented' },
      { variant: 'link', color: 'success', className: 'text-success' },
      { variant: 'link', color: 'warning', className: 'text-warning' },
      { variant: 'link', color: 'info', className: 'text-info' },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'primary',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

export const Button = ({ className, variant, color, size, asChild = false, ...props }: ComponentProps<'button'> & ButtonVariants & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot='button' className={cn(buttonVariants({ variant, color, size }), className)} {...props} />
}
