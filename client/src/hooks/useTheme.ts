import { useEffect, useState } from 'react'
import { useSettings } from '../contexts/settings-context'

export type ThemeSetting = 'light' | 'dark' | 'system'

export const THEMES: ThemeSetting[] = ['light', 'dark', 'system']

type AppliedTheme = 'light' | 'dark'

function getSystemTheme(): AppliedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const { settings, updateSetting } = useSettings()
  const setting: ThemeSetting = settings?.theme ?? 'system'

  const [applied, setApplied] = useState<AppliedTheme>(setting === 'system' ? getSystemTheme() : setting)

  // Sync resolved theme whenever the setting changes
  useEffect(() => {
    setApplied(setting === 'system' ? getSystemTheme() : setting)
  }, [setting])

  // Apply/remove the dark class on <html>
  useEffect(() => {
    if (applied === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [applied])

  // Swap favicon to match the applied theme
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')

    if (!link) return

    const LIGHT = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%23f7c24a"/><rect x="13" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="22" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="31" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><rect x="40" y="16" width="5" height="32" rx="1.5" fill="%231a1a1a"/><path d="M9 49 L52 15" stroke="%231a1a1a" stroke-width="6" stroke-linecap="round"/></svg>`
    const DARK = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%231a1a1a"/><rect x="13" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="22" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="31" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><rect x="40" y="16" width="5" height="32" rx="1.5" fill="%23faf7ee"/><path d="M9 49 L52 15" stroke="%23f7c24a" stroke-width="6" stroke-linecap="round"/></svg>`

    link.href = applied === 'dark' ? DARK : LIGHT
  }, [applied])

  // Track OS preference changes when in system mode
  useEffect(() => {
    if (setting !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setApplied(e.matches ? 'dark' : 'light')

    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [setting])

  const set = (s: ThemeSetting) => updateSetting({ theme: s })

  return { setting, theme: applied, set }
}
