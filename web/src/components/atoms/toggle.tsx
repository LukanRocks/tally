import { ComponentProps } from 'react'
import { Toggle as TogglePrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const toggleVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap capitalize transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: [
          'border-secondary/50 bg-secondary text-secondary-foreground hover:bg-secondary/80',
          'data-[state=on]:border-yellow-tertiary data-[state=on]:bg-yellow-primary data-[state=on]:text-ink-on-yellow data-[state=on]:hover:bg-yellow-tertiary',
        ],
        outline: [
          'bg-card border-border text-ink-secondary hover:border-ink-muted hover:bg-paper-secondary hover:text-ink-primary',
          'data-[state=on]:border-yellow-primary data-[state=on]:text-primary data-[state=on]:hover:border-yellow-tertiary data-[state=on]:hover:bg-yellow-secondary/40',
        ],
        ghost: [
          'bg-transparent text-ink-secondary hover:bg-paper-secondary hover:text-ink-primary',
          'data-[state=on]:text-primary data-[state=on]:hover:bg-yellow-primary/10 data-[state=on]:hover:text-ink-primary',
        ],
      },
      size: {
        small:   "h-7.5 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        default: 'h-9.5 gap-2 px-3.5',
        big:     'h-11.5 gap-2 px-5 text-[15px]',
        icon:    'size-9.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ToggleVariants = VariantProps<typeof toggleVariants>

export type ToggleProps = ComponentProps<typeof TogglePrimitive.Root> & ToggleVariants

export const Toggle = ({ className, variant, size, ...props }: ToggleProps) => (
  <TogglePrimitive.Root
    data-slot='toggle'
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
)
