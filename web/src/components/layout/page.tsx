import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/feedback/loading-screen'

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

  if (loading && showLoader) return <Loading />
  if (loading) return null

  return <div className={cn('mx-auto max-w-5xl p-4 md:p-8', className)}>{children}</div>
}
