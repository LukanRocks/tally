import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type ChipProps = ComponentProps<'span'>

export const Chip = ({ className, ...props }: ChipProps) => {
  const classes = cn(
    'inline-flex h-6 items-center rounded-sm border border-paper-muted bg-paper-secondary px-2 font-mono text-[11.5px] font-medium whitespace-nowrap text-ink-primary capitalize',
    className,
  )

  return <span data-slot='chip' className={classes} {...props} />
}
