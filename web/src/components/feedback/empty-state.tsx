import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  description: string
  children?: ReactNode
  className?: string
}

export const EmptyState = ({ icon: Icon, description, children, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex h-full flex-1 flex-col items-center justify-center pb-24 text-center text-muted-foreground', className)}>
      <Icon size={40} className='mb-4 text-muted-foreground/40' />
      <p className='mb-3'>{description}</p>
      {children && <div className='mt-2.5 flex gap-2'>{children}</div>}
    </div>
  )
}
