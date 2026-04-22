import { createContext, useContext, useEffect, useState } from 'react'
import { api, Settings } from '../lib/api'

type SettingsContextValue = {
  settings: Settings | null
  updateSetting: (patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) => Promise<void>
  refreshSettings: () => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchSettings() {
    const s = await api.settings.get()
    setSettings(s)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  async function updateSetting(patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) {
    const updated = await api.settings.update(patch)
    setSettings(updated)
  }

  async function refreshSettings() {
    await fetchSettings()
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, refreshSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
