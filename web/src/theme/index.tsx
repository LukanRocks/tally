import { useEffect, useState } from 'react'
import { useSettings } from '@/contexts/settings-context'

export type ThemeSetting = 'light' | 'dark' | 'system'

export const AVAILABLE_THEMES: ThemeSetting[] = ['light', 'dark', 'system']

const FAVICON_LIGHT = '/logo-ink.svg'
const FAVICON_DARK = '/logo-yellow.svg'

type AppliedTheme = 'light' | 'dark'

const getSystemTheme = (): AppliedTheme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export const useTheme = () => {
  const { settings, updateSetting } = useSettings()
  const userTheme: ThemeSetting = settings.theme

  const [applied, setApplied] = useState<AppliedTheme>(userTheme === 'system' ? getSystemTheme() : userTheme)

  // Sync resolved theme whenever the userTheme changes
  useEffect(() => {
    setApplied(userTheme === 'system' ? getSystemTheme() : userTheme)
  }, [userTheme])

  // Apply/remove the dark class on <html>
  useEffect(() => {
    if (applied === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [applied])

  // Swap favicon to match the applied theme
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')

    if (!link) return

    link.href = applied === 'dark' ? FAVICON_DARK : FAVICON_LIGHT
  }, [applied])

  // Track OS preference changes when in system mode
  useEffect(() => {
    if (userTheme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event: MediaQueryListEvent) => setApplied(event.matches ? 'dark' : 'light')

    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [userTheme])

  const setTheme = (theme: ThemeSetting) => updateSetting({ theme })

  return { userTheme, activeTheme: applied, setTheme }
}

export const Theme = () => {
  useTheme()

  return null
}
