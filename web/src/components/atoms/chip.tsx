import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Chip = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot='chip'
    className={cn(
      'inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] font-medium text-ink-primary whitespace-nowrap',
      className,
    )}
    {...props}
  />
)
