import { useEffect, useState } from 'react'
import { useSettings } from '@/contexts/settings-context'

export type ThemeSetting = 'light' | 'dark' | 'system'

export const AVAILABLE_THEMES: ThemeSetting[] = ['light', 'dark', 'system']
// !TODO: use files from /public instead of rewriting
const FAVICON_LIGHT = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%23f7c24a"/><rect x="13" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="22" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="31" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="40" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><path d="M9 49 L52 15" stroke="%231a1a1a" stroke-width="6" stroke-linecap="round"/></svg>`
const FAVICON_DARK = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%231a1a1a"/><rect x="13" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="22" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="31" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="40" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><path d="M9 49 L52 15" stroke="%23f7c24a" stroke-width="6" stroke-linecap="round"/></svg>`

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
