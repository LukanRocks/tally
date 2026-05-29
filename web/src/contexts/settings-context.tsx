import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { settingsTransport, Settings } from '@/lib/http-transport/private/settings'
import { Loading } from '@/components/4-templates/loading-screen'
import { ErrorScreen } from '@/components/4-templates/error-screen'

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
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      setSettings(await settingsTransport.get())
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error :('))
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (patch: Partial<Omit<Settings, 'updated_at'>>) => setSettings(await settingsTransport.update(patch))

  const DELETE_ALL_DATA = async () => {
    await settingsTransport.reset()
    setSettings(await settingsTransport.get())
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorScreen error={error} onRetry={fetchSettings} />

  return <SettingsContext.Provider value={{ settings: settings!, updateSetting, DELETE_ALL_DATA }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
