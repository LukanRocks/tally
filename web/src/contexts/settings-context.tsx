import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { settingsTransport, Settings } from '@/lib/http-transport/private/settings'
import { Loading } from '@/components/loading'
import { ErrorScreen } from '@/components/error-screen'

export type { Settings }

type SettingsContextValue = {
  settings: Settings
  updateSetting: (patch: Partial<Omit<Settings, 'updated_at'>>) => Promise<void>
  DELETE_ALL_DATA: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchSettings = async () => {
    try {
      setError(false)
      setSettings(await settingsTransport.get())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (patch: Partial<Omit<Settings, 'updated_at'>>) => setSettings(await settingsTransport.update(patch))

  const DELETE_ALL_DATA = async () => settingsTransport.reset()

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorScreen onRetry={fetchSettings} />

  return <SettingsContext.Provider value={{ settings: settings!, updateSetting, DELETE_ALL_DATA }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
