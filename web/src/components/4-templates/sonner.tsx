import type { CSSProperties } from 'react'
import { useTheme } from '@/theme'
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
        success: <CircleCheckIcon size={18} className='text-ink-primary' />,
        info: <InfoIcon size={18} className='text-ink-primary' />,
        warning: <TriangleAlertIcon size={18} className='text-ink-primary' />,
        error: <OctagonXIcon size={18} className='text-ink-primary' />,
        loading: <Loader2Icon size={18} className='animate-spin text-ink-primary' />,
      }}
      style={
        {
          '--normal-bg': 'var(--paper-secondary)',
          '--normal-text': 'var(--ink-primary)',
          '--normal-border': 'var(--paper-muted)',
          '--success-bg': 'var(--success)',
          '--success-text': 'var(--ink-primary)',
          '--success-border': 'var(--success)',
          '--warning-bg': 'var(--warning)',
          '--warning-text': 'var(--ink-primary)',
          '--warning-border': 'var(--warning)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--ink-primary)',
          '--error-border': 'var(--destructive)',
          '--info-bg': 'var(--info)',
          '--info-text': 'var(--ink-primary)',
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
