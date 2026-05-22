import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, Settings } from '@/lib/api'
import { Loading } from '@/components/loading'
import { ErrorScreen } from '@/components/error-screen'

export type { Settings }

type SettingsContextValue = {
  settings: Settings
  updateSetting: (patch: Partial<Omit<Settings, 'updated_at'>>) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchSettings = async () => {
    try {
      setError(false)

      const settings = await api.settings.get()

      setSettings(settings)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (patch: Partial<Omit<Settings, 'updated_at'>>) => {
    const updated = await api.settings.update(patch)

    setSettings(updated)
  }

  const refreshSettings = async () => await fetchSettings()

  useEffect(() => {
    fetchSettings()
  }, [])

  if (isLoading) return <Loading />
  if (error) return <ErrorScreen onRetry={fetchSettings} />

  return <SettingsContext.Provider value={{ settings: settings!, updateSetting, refreshSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
