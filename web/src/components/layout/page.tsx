import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageProps {
  container?: boolean
  className?: string
  children: ReactNode
}

export const Page = ({ children, className, container = false }: PageProps) => (
  <div className={cn('flex min-h-full flex-col gap-4 p-4 md:p-8', container && 'mx-auto max-w-5xl', className)}>{children}</div>
)

export const PageHeader = ({ title, caption, children }: { title: string; caption: string; children?: ReactNode }) => (
  <header className='flex flex-col gap-2'>
    <span className='caption text-ink-muted'>{caption} </span>
    <div className='flex flex-row items-center justify-between'>
      <h1 className='text-5xl font-bold'>{title}</h1>
      <div className='flex flex-row items-center gap-2'>{children}</div>
    </div>
  </header>
)
