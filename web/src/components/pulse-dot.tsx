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
      gold: '[--pulse-color:theme(colors.1st-place)]',
      silver: '[--pulse-color:theme(colors.2nd-place)]',
      bronze: '[--pulse-color:theme(colors.3rd-place)]',
      self: '[--pulse-color:theme(colors.status-self)]',
      friend: '[--pulse-color:theme(colors.status-friend)]',
      store: '[--pulse-color:theme(colors.status-store)]',
      success: '[--pulse-color:theme(colors.success)]',
      warning: '[--pulse-color:theme(colors.warning)]',
      info: '[--pulse-color:theme(colors.info)]',
      destructive: '[--pulse-color:theme(colors.destructive)]',
      primary: '[--pulse-color:theme(colors.primary)]',
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
    <span className='absolute inline-flex size-full animate-ping rounded-full bg-[--pulse-color] opacity-75' />
    <span className='relative inline-flex size-full rounded-full bg-[--pulse-color]' />
  </span>
)
