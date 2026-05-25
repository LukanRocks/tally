import type { CSSProperties } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react'

export const Toaster = ({ ...props }: ToasterProps) => {
  const { userTheme } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={userTheme as ToasterProps['theme']}
      richColors
      position={isMobile ? 'top-center' : 'bottom-center'}
      className='toaster group'
      icons={{
        success: <CircleCheckIcon className='size-4 text-success' />,
        info: <InfoIcon className='size-4 text-info' />,
        warning: <TriangleAlertIcon className='size-4 text-warning' />,
        error: <OctagonXIcon className='size-4 text-destructive' />,
        loading: <Loader2Icon className='size-4 animate-spin text-muted-foreground' />,
      }}
      style={
        {
          '--normal-bg': 'var(--surface-elevated)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'color-mix(in oklch, var(--success) 20%, transparent)',
          '--success-text': 'var(--foreground)',
          '--success-border': 'var(--success)',
          '--warning-bg': 'color-mix(in oklch, var(--warning) 20%, transparent)',
          '--warning-text': 'var(--foreground)',
          '--warning-border': 'var(--warning)',
          '--error-bg': 'color-mix(in oklch, var(--destructive) 20%, transparent)',
          '--error-text': 'var(--foreground)',
          '--error-border': 'var(--destructive)',
          '--info-bg': 'color-mix(in oklch, var(--info) 20%, transparent)',
          '--info-text': 'var(--foreground)',
          '--info-border': 'var(--info)',
          '--border-radius': '9999px',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast !py-2.5 !px-4',
        },
      }}
      {...props}
    />
  )
}
