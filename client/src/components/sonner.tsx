import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      richColors
      position={isMobile ? 'top-center' : 'bottom-right'}
      className='toaster group'
      icons={{
        success: <CircleCheckIcon className='size-4 text-ds-success' />,
        info: <InfoIcon className='size-4 text-ds-info' />,
        warning: <TriangleAlertIcon className='size-4 text-ds-warning' />,
        error: <OctagonXIcon className='size-4 text-ds-destructive' />,
        loading: <Loader2Icon className='size-4 animate-spin text-ds-muted-foreground' />,
      }}
      style={
        {
          '--normal-bg': 'var(--ds-surface-elevated)',
          '--normal-text': 'var(--ds-foreground)',
          '--normal-border': 'var(--ds-border)',
          '--success-bg': 'color-mix(in oklch, var(--ds-success) 20%, transparent)',
          '--success-text': 'var(--ds-foreground)',
          '--success-border': 'var(--ds-success)',
          '--warning-bg': 'color-mix(in oklch, var(--ds-warning) 20%, transparent)',
          '--warning-text': 'var(--ds-foreground)',
          '--warning-border': 'var(--ds-warning)',
          '--error-bg': 'color-mix(in oklch, var(--ds-destructive) 20%, transparent)',
          '--error-text': 'var(--ds-foreground)',
          '--error-border': 'var(--ds-destructive)',
          '--info-bg': 'color-mix(in oklch, var(--ds-info) 20%, transparent)',
          '--info-text': 'var(--ds-foreground)',
          '--info-border': 'var(--ds-info)',
          '--border-radius': 'var(--radius)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
