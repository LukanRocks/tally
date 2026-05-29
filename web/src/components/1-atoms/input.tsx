import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Textarea } from './textarea'

export type InputProps = ComponentProps<'input'>

// number" | "color" | "search" | "time" | "text" | "date" | "datetime-local" | "email" | "file" | "month" | "password" | "radio" | "range" | "reset" | "submit" | "tel" | "url" | "week" | (string & {})

export const Input = ({ className, ...props }: InputProps) => (
  <input
    data-slot='input'
    className={cn(
      'h-9 w-full min-w-0 rounded-lg border border-transparent bg-paper-muted/50 px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-paper-secondary file:px-2 file:mr-3 file:text-sm file:font-medium file:text-ink-primary placeholder:text-ink-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
      className,
    )}
    {...props}
  />
)

export const InputGroup = ({ className, ...props }: ComponentProps<'div'>) => {
  const classes = cn(
    'group/input-group relative flex h-9 w-full min-w-0 items-center rounded-lg border border-transparent bg-paper-muted/50 transition-[color,box-shadow,background-color] outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-data-[align=block-end]:rounded-lg has-data-[align=block-start]:rounded-lg has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[textarea]:rounded-lg has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5',
    className,
  )

  return <div data-slot='input-group' role='group' className={classes} {...props} />
}

const INPUT_GROUP_ADDON_VARIANTS_CONFIG = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-ink-muted select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-3xl **:data-[slot=kbd]:bg-ink-muted/10 **:data-[slot=kbd]:px-1.5 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3 has-[>button]:-ml-1 has-[>kbd]:-ml-1',
        'inline-end': 'order-last pr-3 has-[>button]:-mr-1 has-[>kbd]:-mr-1',
        'block-start': 'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-3.5 [.border-b]:pb-3.5',
        'block-end': 'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-3.5 [.border-t]:pt-3.5',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

export type INPUT_GROUP_ADDON_VARIANTS_PROPS = VariantProps<typeof INPUT_GROUP_ADDON_VARIANTS_CONFIG>
export type INPUT_GROUP_ADDON_ALIGN = NonNullable<INPUT_GROUP_ADDON_VARIANTS_PROPS['align']>
export const INPUT_GROUP_ADDON_ALIGNS: INPUT_GROUP_ADDON_ALIGN[] = ['inline-start', 'inline-end', 'block-start', 'block-end']

export type InputGroupAddonProps = ComponentProps<'div'> & INPUT_GROUP_ADDON_VARIANTS_PROPS

export const InputGroupAddon = ({ className, align = 'inline-start', ...props }: InputGroupAddonProps) => {
  const classes = cn(INPUT_GROUP_ADDON_VARIANTS_CONFIG({ align }), className)

  return (
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={classes}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const INPUT_GROUP_BUTTON_VARIANTS_CONFIG = cva(
  'inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent font-semibold whitespace-nowrap capitalize transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0',
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
        xs: "h-6 gap-1 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': 'size-6 p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
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
      size: 'xs',
    },
  },
)

export type INPUT_GROUP_BUTTON_VARIANTS_PROPS = VariantProps<typeof INPUT_GROUP_BUTTON_VARIANTS_CONFIG>

export type INPUT_GROUP_BUTTON_VARIANT = NonNullable<INPUT_GROUP_BUTTON_VARIANTS_PROPS['variant']>
export const INPUT_GROUP_BUTTON_VARIANTS: INPUT_GROUP_BUTTON_VARIANT[] = ['default', 'outline', 'ghost', 'link']

export type INPUT_GROUP_BUTTON_COLOR = NonNullable<INPUT_GROUP_BUTTON_VARIANTS_PROPS['color']>
export const INPUT_GROUP_BUTTON_COLORS: INPUT_GROUP_BUTTON_COLOR[] = ['primary', 'secondary', 'destructive']

export type INPUT_GROUP_BUTTON_SIZE = NonNullable<INPUT_GROUP_BUTTON_VARIANTS_PROPS['size']>
export const INPUT_GROUP_BUTTON_SIZES: INPUT_GROUP_BUTTON_SIZE[] = ['xs', 'sm', 'icon-xs', 'icon-sm']

export type InputGroupButtonProps = ComponentProps<'button'> & INPUT_GROUP_BUTTON_VARIANTS_PROPS

export const InputGroupButton = ({ className, type = 'button', variant, color, size, ...props }: InputGroupButtonProps) => {
  const classes = cn(INPUT_GROUP_BUTTON_VARIANTS_CONFIG({ variant, color, size }), className)

  return <Button type={type} data-slot='button' data-variant={variant} data-color={color} data-size={size} className={classes} {...props} />
}

export type InputGroupTextProps = ComponentProps<'span'>

export const InputGroupText = ({ className, ...props }: InputGroupTextProps) => {
  const classes = cn("flex items-center gap-2 text-sm text-ink-muted [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", className)

  return <span className={classes} {...props} />
}

export type InputGroupInputProps = ComponentProps<'input'>

export const InputGroupInput = ({ className, ...props }: InputGroupInputProps) => {
  const classes = cn('flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0', className)

  return <Input data-slot='input-group-control' className={classes} {...props} />
}

export type InputGroupTextareaProps = ComponentProps<'textarea'>

export const InputGroupTextarea = ({ className, ...props }: InputGroupTextareaProps) => {
  const classes = cn('flex-1 resize-none rounded-none border-0 bg-transparent py-2.5 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0', className)

  return <Textarea data-slot='input-group-control' className={classes} {...props} />
}
