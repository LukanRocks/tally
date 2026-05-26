import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/feedback/loading-screen'

interface PageProps {
  children: ReactNode
  loading?: boolean
  className?: string
  container?: boolean
}

export const Page = ({ children, loading, className, container = false }: PageProps) => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowLoader(false)

      return
    }

    const timer = setTimeout(() => setShowLoader(true), 200)

    return () => clearTimeout(timer)
  }, [loading])

  if (loading && showLoader) return <Loading />
  if (loading) return null

  return <div className={cn('space-y-4 p-4 md:p-8', container && 'mx-auto max-w-5xl', className)}>{children}</div>
}

export const PageHeader = ({ title, caption }: { title: string; caption: string }) => (
  <header className='flx flex-col gap-2'>
    <span className='caption text-ink-muted'>{caption} </span>
    <h1 className='text-5xl font-bold'>{title}</h1>
  </header>
)
