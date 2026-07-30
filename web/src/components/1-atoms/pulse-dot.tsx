import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const PULSE_DOT_VARIANTS_CONFIG = cva('relative flex shrink-0', {
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
      win: '[--pulse-color:var(--color-win)]',
      loss: '[--pulse-color:var(--color-loss)]',
      tie: '[--pulse-color:var(--color-tie)]',
      owned: '[--pulse-color:var(--color-owned)]',
      borrowed: '[--pulse-color:var(--color-borrowed)]',
      rented: '[--pulse-color:var(--color-rented)]',
      success: '[--pulse-color:var(--color-success)]',
      warning: '[--pulse-color:var(--color-warning)]',
      info: '[--pulse-color:var(--color-info)]',
      destructive: '[--pulse-color:var(--color-destructive)]',
      primary: '[--pulse-color:var(--color-primary)]',
      secondary: '[--pulse-color:var(--color-secondary)]',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
})

export type PULSE_DOT_VARIANTS_PROPS = VariantProps<typeof PULSE_DOT_VARIANTS_CONFIG>

export type PULSE_DOT_SIZE = NonNullable<PULSE_DOT_VARIANTS_PROPS['size']>
export const PULSE_DOT_SIZES: PULSE_DOT_SIZE[] = ['sm', 'md', 'lg']

export type PULSE_DOT_COLOR = NonNullable<PULSE_DOT_VARIANTS_PROPS['color']>
export const PULSE_DOT_COLORS: PULSE_DOT_COLOR[] = [
  'gold',
  'silver',
  'bronze',
  'win',
  'loss',
  'tie',
  'owned',
  'borrowed',
  'rented',
  'success',
  'warning',
  'info',
  'destructive',
  'primary',
  'secondary',
]

export type PulseDotProps = PULSE_DOT_VARIANTS_PROPS & { className?: string; pulsing?: boolean }

export const PulseDot = ({ size, color, className, pulsing = true }: PulseDotProps) => {
  const classes = cn(PULSE_DOT_VARIANTS_CONFIG({ size, color }), className)

  return (
    <span data-slot='pulse-dot' data-size={size} data-color={color} className={classes}>
      {pulsing && <span className='absolute inline-flex size-full animate-ping rounded-full bg-(--pulse-color) opacity-75' />}
      <span className='relative inline-flex size-full rounded-full bg-(--pulse-color)' />
    </span>
  )
}
