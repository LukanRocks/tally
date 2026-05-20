import { ReactNode, useEffect, useState } from 'react'
import { cn } from '../lib/utils'

interface PageProps {
  children: ReactNode
  loading?: boolean
  className?: string
}

export const Page = ({ children, loading, className }: PageProps) => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowLoader(false)

      return
    }

    const timer = setTimeout(() => setShowLoader(true), 200)

    return () => clearTimeout(timer)
  }, [loading])

  if (loading && showLoader) return <div className='p-4 text-muted-foreground md:p-8'>Loading…</div>
  if (loading) return null

  return <div className={cn('mx-auto max-w-5xl space-y-12 p-4 md:p-8', className)}>{children}</div>
}
