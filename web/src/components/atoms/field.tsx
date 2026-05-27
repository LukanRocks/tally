import { useMemo, ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Label } from '@/components/atoms/label'
import { Separator } from '@/components/atoms/separator'

const FIELD_VARIANTS_CONFIG = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

export type FIELD_VARIANTS_PROPS = VariantProps<typeof FIELD_VARIANTS_CONFIG>

export type FIELD_ORIENTATION = NonNullable<FIELD_VARIANTS_PROPS['orientation']>
export const FIELD_ORIENTATIONS: FIELD_ORIENTATION[] = ['vertical', 'horizontal', 'responsive']

export type FieldProps = ComponentProps<'div'> & FIELD_VARIANTS_PROPS

export const Field = ({ className, orientation = 'vertical', ...props }: FieldProps) => {
  const classes = cn(FIELD_VARIANTS_CONFIG({ orientation }), className)

  return <div role='group' data-slot='field' data-orientation={orientation} className={classes} {...props} />
}

export type FieldSetProps = ComponentProps<'fieldset'>

export const FieldSet = ({ className, ...props }: FieldSetProps) => {
  const classes = cn('flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3', className)

  return <fieldset data-slot='field-set' className={classes} {...props} />
}

export type FieldLegendProps = ComponentProps<'legend'> & { variant?: 'legend' | 'label' }

export const FieldLegend = ({ className, variant = 'legend', ...props }: FieldLegendProps) => {
  const classes = cn('mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base', className)

  return <legend data-slot='field-legend' data-variant={variant} className={classes} {...props} />
}

export type FieldGroupProps = ComponentProps<'div'>

export const FieldGroup = ({ className, ...props }: FieldGroupProps) => {
  const classes = cn('group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4', className)

  return <div data-slot='field-group' className={classes} {...props} />
}

export type FieldContentProps = ComponentProps<'div'>

export const FieldContent = ({ className, ...props }: FieldContentProps) => {
  const classes = cn('group/field-content flex flex-1 flex-col gap-1 leading-snug', className)

  return <div data-slot='field-content' className={classes} {...props} />
}

export type FieldLabelProps = ComponentProps<typeof Label>

export const FieldLabel = ({ className, ...props }: FieldLabelProps) => {
  const classes = cn(
    'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-paper-muted/30 has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border *:data-[slot=field]:p-4',
    'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
    className,
  )

  return <Label data-slot='field-label' className={classes} {...props} />
}

export type FieldTitleProps = ComponentProps<'div'>

export const FieldTitle = ({ className, ...props }: FieldTitleProps) => {
  const classes = cn('flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50', className)

  return <div data-slot='field-label' className={classes} {...props} />
}

export type FieldDescriptionProps = ComponentProps<'p'>

export const FieldDescription = ({ className, ...props }: FieldDescriptionProps) => {
  const classes = cn(
    'text-left text-sm leading-normal font-normal text-ink-muted group-has-data-horizontal/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-ink-primary [[data-variant=legend]+&]:-mt-1.5',
    className,
  )

  return <p data-slot='field-description' className={classes} {...props} />
}

export type FieldSeparatorProps = ComponentProps<'div'>

export const FieldSeparator = ({ children, className, ...props }: FieldSeparatorProps) => {
  const classes = cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', className)

  return (
    <div data-slot='field-separator' data-content={!!children} className={classes} {...props}>
      <Separator className='absolute inset-0 top-1/2' />
      {children && (
        <span data-slot='field-separator-content' className='relative mx-auto block w-fit bg-paper-primary px-2 text-ink-muted'>
          {children}
        </span>
      )}
    </div>
  )
}

export type FieldErrorProps = ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}

export const FieldError = ({ className, children, errors, ...props }: FieldErrorProps) => {
  const classes = cn('text-sm font-normal text-destructive', className)

  const content = useMemo(() => {
    if (children) return children
    if (!errors?.length) return null

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors.length === 1) return uniqueErrors[0]?.message

    return <ul className='ml-4 flex list-disc flex-col gap-1'>{uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}</ul>
  }, [children, errors])

  if (!content) return null

  return (
    <div role='alert' data-slot='field-error' className={classes} {...props}>
      {content}
    </div>
  )
}
