import { createContext, useContext, useEffect, useState } from 'react'
import { api, Settings } from '../lib/api'

type SettingsContextValue = {
  settings: Settings | null
  updateSetting: (patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.settings.get().then((s) => {
      setSettings(s)
      setIsLoading(false)
    })
  }, [])

  async function updateSetting(patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) {
    const updated = await api.settings.update(patch)
    setSettings(updated)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
