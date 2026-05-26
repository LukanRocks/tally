import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap capitalize transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-card',
        ghost: 'bg-transparent',
        link: 'underline-offset-4 hover:underline',
      },
      color: {
        primary: '',
        secondary: '',
        destructive: '',
      },
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

      // ── outline ────────────────────────────────────────────────────────
      { variant: 'outline', color: 'primary', className: 'border-yellow-primary text-primary hover:border-yellow-tertiary hover:bg-yellow-secondary/40' },
      { variant: 'outline', color: 'secondary', className: 'border-border text-ink-secondary hover:border-ink-muted hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'outline', color: 'destructive', className: 'border-destructive/35 text-destructive hover:border-destructive hover:bg-destructive/10' },

      // ── ghost ──────────────────────────────────────────────────────────
      { variant: 'ghost', color: 'primary', className: 'text-primary hover:bg-yellow-primary/10 hover:text-ink-primary' },
      { variant: 'ghost', color: 'secondary', className: 'text-ink-secondary hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'ghost', color: 'destructive', className: 'text-destructive hover:bg-destructive/10' },

      // ── link ───────────────────────────────────────────────────────────
      { variant: 'link', color: 'primary', className: 'text-primary' },
      { variant: 'link', color: 'secondary', className: 'text-ink-secondary' },
      { variant: 'link', color: 'destructive', className: 'text-destructive' },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'primary',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
export type ButtonColor = NonNullable<ButtonVariants['color']>
export type ButtonSize = NonNullable<ButtonVariants['size']>

export const buttonColorGroups: { label: string; colors: ButtonColor[] }[] = [
  { label: 'Neutral', colors: ['primary', 'secondary'] },
  { label: 'Feedback', colors: ['destructive'] },
]

export const buttonSizes: ButtonSize[] = ['small', 'default', 'big', 'icon']

export const Button = ({ className, variant, color, size, asChild = false, ...props }: ComponentProps<'button'> & ButtonVariants & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot='button' className={cn(buttonVariants({ variant, color, size }), className)} {...props} />
}
