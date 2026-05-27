import { ComponentProps } from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

export type SeparatorProps = ComponentProps<typeof SeparatorPrimitive.Root>

export const Separator = ({ className, orientation = 'horizontal', decorative = true, ...props }: SeparatorProps) => {
  const classes = cn('shrink-0 bg-paper-muted data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch', className)

  return <SeparatorPrimitive.Root data-slot='separator' decorative={decorative} orientation={orientation} className={classes} {...props} />
}
