import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
  className?: string
}

export const EmptyState = ({ icon: Icon, title, description, children, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-9 text-center shadow-sm', className)}>
      <div className='mb-2 flex h-20 w-20 items-center justify-center rounded-xl bg-paper-secondary'>
        <Icon size={40} strokeWidth={1.5} className='text-ink-muted' />
      </div>
      <h3 className='mt-1.5 text-lg font-bold text-ink-primary'>{title}</h3>
      <p className='max-w-xs text-sm text-ink-muted'>{description}</p>
      {children && <div className='mt-2.5 flex gap-2'>{children}</div>}
    </div>
  )
}
