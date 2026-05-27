import { ComponentProps, ElementType } from 'react'
import { cn } from '@/lib/utils'

type InputProps = ComponentProps<'input'> & { Icon?: ElementType }

export const Input = ({ Icon, className, ...props }: InputProps) => (
  <div className='relative'>
    {Icon && (
      <div className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted'>
        <Icon size={15} />
      </div>
    )}
    <input
      data-slot='input'
      className={cn(
        'h-9 w-full min-w-0 rounded-lg border border-transparent bg-paper-muted/50 py-1 text-sm transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-primary placeholder:text-ink-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        Icon ? 'pr-3 pl-9' : 'px-3',
        className,
      )}
      {...props}
    />
  </div>
)

// number" | "color" | "search" | "time" | "text" | "date" | "datetime-local" | "email" | "file" | "month" | "password" | "radio" | "range" | "reset" | "submit" | "tel" | "url" | "week" | (string & {})
