import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, Settings } from '@/lib/api'
import { Loading } from '@/components/loading'
import { ErrorScreen } from '@/components/error-screen'

export type { Settings }

type SettingsContextValue = {
  settings: Settings
  updateSetting: (patch: Partial<Omit<Settings, 'updated_at'>>) => Promise<void>
  resetSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchSettings = async () => {
    try {
      setError(false)
      setSettings(await api.settings.get())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (patch: Partial<Omit<Settings, 'updated_at'>>) => setSettings(await api.settings.update(patch))

  // maybe we return new settings after reset
  const resetSettings = async () => {
    await api.settings.reset()
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorScreen onRetry={fetchSettings} />

  return <SettingsContext.Provider value={{ settings: settings!, updateSetting, resetSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
