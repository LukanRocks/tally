import { useEffect, useState } from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'
type AppliedTheme = 'light' | 'dark'

function getSystemTheme(): AppliedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialSetting(): ThemeSetting {
  const stored = localStorage.getItem('theme') as ThemeSetting | null
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

export function useTheme() {
  const [setting, setSetting] = useState<ThemeSetting>(getInitialSetting)

  const applied: AppliedTheme = setting === 'system' ? getSystemTheme() : setting

  useEffect(() => {
    const root = document.documentElement
    if (applied === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [applied])

  const set = (s: ThemeSetting) => {
    setSetting(s)
    localStorage.setItem('theme', s)
  }

  const toggle = () => set(setting === 'dark' ? 'light' : 'dark')

  return { setting, theme: applied, set, toggle }
}
