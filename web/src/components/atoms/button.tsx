import { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/atoms/separator'

const BUTTON_VARIANTS_CONFIG = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap capitalize transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-transparent',
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
      { variant: 'outline', color: 'secondary', className: 'border-ink-muted/40 text-ink-secondary hover:border-ink-muted hover:bg-paper-secondary hover:text-ink-primary' },
      { variant: 'outline', color: 'destructive', className: 'border-destructive/35 bg-transparent text-destructive hover:border-destructive hover:bg-destructive/10' },

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

export type BUTTON_VARIANTS_PROPS = VariantProps<typeof BUTTON_VARIANTS_CONFIG>

export type BUTTON_VARIANT = NonNullable<BUTTON_VARIANTS_PROPS['variant']>
export const BUTTON_VARIANTS: BUTTON_VARIANT[] = ['default', 'outline', 'ghost', 'link']

export type BUTTON_COLOR = NonNullable<BUTTON_VARIANTS_PROPS['color']>
export const BUTTON_COLORS: BUTTON_COLOR[] = ['primary', 'secondary', 'destructive']

export type BUTTON_SIZE = NonNullable<BUTTON_VARIANTS_PROPS['size']>
export const BUTTON_SIZES: BUTTON_SIZE[] = ['small', 'default', 'big', 'icon']

export type ButtonProps = ComponentProps<'button'> & BUTTON_VARIANTS_PROPS & { polymorphic?: boolean }

export const Button = ({ variant, color, size, className, polymorphic = false, ...props }: ButtonProps) => {
  const Component = polymorphic ? Slot.Root : 'button'
  const classes = cn(BUTTON_VARIANTS_CONFIG({ variant, color, size }), className)

  return <Component data-slot='button' data-variant={variant} data-color={color} data-size={size} className={classes} {...props} />
}

export const BUTTON_GROUP_VARIANTS_CONFIG = cva(
  "group/button-group flex w-fit items-stretch *:hover:relative *:hover:z-10 *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[>[data-variant=outline]]:*:data-[slot=input-group]:border-border has-[>[data-variant=outline]]:*:data-[slot=select-trigger]:border-border has-[>[data-variant=outline]]:[&>[data-slot=input-group]:has(:focus-visible)]:border-ring has-[>[data-variant=outline]]:[&>[data-slot=select-trigger]:focus-visible]:border-ring has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-4xl [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[>[data-variant=outline]]:[&>input]:border-border has-[>[data-variant=outline]]:[&>input:focus-visible]:border-ring",
  {
    variants: {
      orientation: {
        horizontal: '[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        vertical: 'flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

export type BUTTON_GROUP_VARIANTS_PROPS = VariantProps<typeof BUTTON_GROUP_VARIANTS_CONFIG>

export type BUTTON_GROUP_ORIENTATION = NonNullable<BUTTON_GROUP_VARIANTS_PROPS['orientation']>
export const BUTTON_GROUP_ORIENTATIONS: BUTTON_GROUP_ORIENTATION[] = ['horizontal', 'vertical']

export type ButtonGroupProps = ComponentProps<'div'> & BUTTON_GROUP_VARIANTS_PROPS

export const ButtonGroup = ({ className, orientation, ...props }: ButtonGroupProps) => {
  const classes = cn(BUTTON_GROUP_VARIANTS_CONFIG({ orientation }), className)

  return <div role='group' data-slot='button-group' data-orientation={orientation} className={classes} {...props} />
}

export type ButtonGroupTextProps = ComponentProps<'div'> & { polymorphic?: boolean }

export const ButtonGroupText = ({ className, polymorphic = false, ...props }: ButtonGroupTextProps) => {
  const Component = polymorphic ? Slot.Root : 'div'
  const classes = cn("flex items-center gap-2 rounded-md border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", className)

  return <Component data-slot='button-group-text' className={classes} {...props} />
}

export type ButtonGroupSeparatorProps = ComponentProps<typeof Separator>

export const ButtonGroupSeparator = ({ className, orientation = 'vertical', ...props }: ButtonGroupSeparatorProps) => {
  const classes = cn('relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto', className)

  return <Separator data-slot='button-group-separator' orientation={orientation} className={classes} {...props} />
}
