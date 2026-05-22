import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, Settings } from '@/lib/api'

type SettingsContextValue = {
  settings?: Settings
  updateSetting: (patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) => Promise<void>
  refreshSettings: () => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    const settings = await api.settings.get()

    setSettings(settings)
    setIsLoading(false)
  }

  const updateSetting = async (patch: Partial<Omit<Settings, 'id' | 'updated_at'>>) => {
    const updated = await api.settings.update(patch)

    setSettings(updated)
  }

  const refreshSettings = async () => await fetchSettings()

  useEffect(() => {
    fetchSettings()
  }, [])

  return <SettingsContext.Provider value={{ settings, updateSetting, refreshSettings, isLoading }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
