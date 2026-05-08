import { useEffect, useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'

export type ThemeSetting = 'light' | 'dark' | 'system'
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
    if (applied === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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
