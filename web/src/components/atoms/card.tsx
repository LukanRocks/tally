import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const CARD_VARIANTS_CONFIG = cva('group/card flex flex-col overflow-hidden border border-border text-sm text-ink-primary has-[>img:first-child]:pt-0', {
  variants: {
    color: {
      primary: 'bg-paper-secondary',
      secondary: 'bg-paper-muted',
    },
    size: {
      default: 'gap-6 rounded-2xl py-6 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl',
      sm: 'gap-4 rounded-xl py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
    },
    elevation: {
      none: 'shadow-none',
      xs: 'shadow-xs',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      stamp: 'shadow-stamp',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'default',
    elevation: 'none',
  },
})

export type CARD_VARIANTS_PROPS = VariantProps<typeof CARD_VARIANTS_CONFIG>

export type CARD_COLOR = NonNullable<CARD_VARIANTS_PROPS['color']>
export const CARD_COLORS: CARD_COLOR[] = ['primary', 'secondary']

export type CARD_SIZE = NonNullable<CARD_VARIANTS_PROPS['size']>
export const CARD_SIZES: CARD_SIZE[] = ['default', 'sm']

export type CARD_ELEVATION = NonNullable<CARD_VARIANTS_PROPS['elevation']>
export const CARD_ELEVATIONS: CARD_ELEVATION[] = ['none', 'xs', 'sm', 'md', 'lg', 'stamp']

export type CardProps = ComponentProps<'div'> & CARD_VARIANTS_PROPS

export const Card = ({ color, size, elevation, className, ...props }: CardProps) => {
  const classes = cn(CARD_VARIANTS_CONFIG({ color, size, elevation }), className)

  return <div data-slot='card' data-color={color} data-size={size} data-elevation={elevation} className={classes} {...props} />
}

export type CardHeaderProps = ComponentProps<'div'>

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  const classes = cn(
    'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-2xl px-6 group-data-[size=sm]/card:rounded-t-xl group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
    className,
  )

  return <div data-slot='card-header' className={classes} {...props} />
}

export type CardCaptionProps = ComponentProps<'div'>

export const CardCaption = ({ className, ...props }: CardCaptionProps) => {
  const classes = cn('caption', className)

  return <div data-slot='card-caption' className={classes} {...props} />
}

export type CardTitleProps = ComponentProps<'div'>

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  const classes = cn('h2 group-data-[size=sm]/card:h3', className)

  return <div data-slot='card-title' className={classes} {...props} />
}

export type CardDescriptionProps = ComponentProps<'div'>

export const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
  const classes = cn('body', className)

  return <div data-slot='card-description' className={classes} {...props} />
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
  const classes = cn(
    'flex items-center rounded-b-2xl px-6 group-data-[size=sm]/card:rounded-b-xl group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4',
    className,
  )

  return <div data-slot='card-footer' className={classes} {...props} />
}
