import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const CARD_VARIANTS_CONFIG = cva(
  'group/card flex flex-col overflow-hidden rounded-4xl bg-paper-primary text-sm text-ink-primary shadow-md ring-1 ring-ink-primary/5 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl',
  {
    variants: {
      size: {
        default: 'gap-6 py-6',
        sm: 'gap-4 py-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type CARD_VARIANTS_PROPS = VariantProps<typeof CARD_VARIANTS_CONFIG>

export type CARD_SIZE = NonNullable<CARD_VARIANTS_PROPS['size']>
export const CARD_SIZES: CARD_SIZE[] = ['default', 'sm']

export type CardProps = ComponentProps<'div'> & CARD_VARIANTS_PROPS

export const Card = ({ size, className, ...props }: CardProps) => {
  const classes = cn(CARD_VARIANTS_CONFIG({ size }), className)

  return <div data-slot='card' data-size={size} className={classes} {...props} />
}

export type CardHeaderProps = ComponentProps<'div'>

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  const classes = cn(
    'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
    className,
  )

  return <div data-slot='card-header' className={classes} {...props} />
}

export type CardCaptionProps = ComponentProps<'div'>

export const CardCaption = ({ className, ...props }: CardCaptionProps) => {
  const classes = cn('caption text-ink-muted', className)

  return <div data-slot='card-description' className={classes} {...props} />
}

export type CardTitleProps = ComponentProps<'div'>

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  const classes = cn('text-base font-medium', className)

  return <div data-slot='card-title' className={classes} {...props} />
}

export type CardActionProps = ComponentProps<'div'>

export const CardAction = ({ className, ...props }: CardActionProps) => {
  const classes = cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)

  return <div data-slot='card-action' className={classes} {...props} />
}

export type CardContentProps = ComponentProps<'div'>

export const CardContent = ({ className, ...props }: CardContentProps) => {
  const classes = cn('px-6 group-data-[size=sm]/card:px-4', className)

  return <div data-slot='card-content' className={classes} {...props} />
}

export type CardFooterProps = ComponentProps<'div'>

export const CardFooter = ({ className, ...props }: CardFooterProps) => {
  const classes = cn('flex items-center rounded-b-4xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4', className)

  return <div data-slot='card-footer' className={classes} {...props} />
}
