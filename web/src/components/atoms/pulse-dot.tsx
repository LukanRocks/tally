import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { type ComponentColor } from '@/lib/colors'

const pulseDotVariants = cva('relative flex shrink-0', {
  variants: {
    size: {
      sm: 'size-2',
      md: 'size-2.5',
      lg: 'size-3',
    },
    color: {
      gold: '[--pulse-color:var(--color-1st-place)]',
      silver: '[--pulse-color:var(--color-2nd-place)]',
      bronze: '[--pulse-color:var(--color-3rd-place)]',
      owned: '[--pulse-color:var(--color-status-owned)]',
      borrowed: '[--pulse-color:var(--color-status-borrowed)]',
      rented: '[--pulse-color:var(--color-status-rented)]',
      success: '[--pulse-color:var(--color-success)]',
      warning: '[--pulse-color:var(--color-warning)]',
      info: '[--pulse-color:var(--color-info)]',
      destructive: '[--pulse-color:var(--color-destructive)]',
      primary: '[--pulse-color:var(--color-primary)]',
      secondary: '[--pulse-color:var(--color-secondary)]',
    } satisfies Record<ComponentColor, string>,
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
})

export type PulseDotProps = VariantProps<typeof pulseDotVariants> & { className?: string }

export const PulseDot = ({ size, color, className }: PulseDotProps) => (
  <span className={cn(pulseDotVariants({ size, color }), className)}>
    <span className='absolute inline-flex size-full animate-ping rounded-full bg-(--pulse-color) opacity-75' />
    <span className='relative inline-flex size-full rounded-full bg-(--pulse-color)' />
  </span>
)
