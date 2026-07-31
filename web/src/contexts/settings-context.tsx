import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { settingsTransport, Settings } from '@/lib/http-transport/private/settings'
import { systemTransport, type DbStatus } from '@/lib/http-transport/private/system'
import { Loading } from '@/components/4-templates/loading-screen'
import { ErrorScreen } from '@/components/4-templates/error-screen'
import { ImportDecisionScreen } from '@/components/4-templates/import-decision-screen'

import type { HttpError } from '@/lib/http-transport/helpers'

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
  const [pendingImport, setPendingImport] = useState<DbStatus | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    setPendingImport(null)

    try {
      setSettings(await settingsTransport.get())
    } catch (error) {
      // This request is already the app's mount-time health check, so the states
      // the backend can be stuck in surface here rather than in a separate poll
      // every healthy boot would also pay for.
      //
      // PENDING_IMPORT is the one that needs a second request: the 503 body says
      // what is wrong but not how much data is waiting, and the decision screen
      // has to show the user what they are about to move.
      if ((error as HttpError)?.state === 'PENDING_IMPORT') {
        setPendingImport(await readPendingStatus(error as HttpError))
      } else {
        setError(error instanceof Error ? error : new Error('Unknown error :('))
      }
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
  if (pendingImport) return <ImportDecisionScreen status={pendingImport} onImport={systemTransport.importFromSqlite} onDone={fetchSettings} />
  if (error) return <ErrorScreen error={error} onRetry={fetchSettings} />

  return <SettingsContext.Provider value={{ settings: settings!, updateSetting, DELETE_ALL_DATA }}>{children}</SettingsContext.Provider>
}

/**
 * Row counts for the decision screen.
 *
 * Falling back to the gate's own payload matters: if this second request fails,
 * the app must still show the decision screen. Dropping through to the error
 * screen would strand the user in a state whose only exit is the button this
 * screen owns.
 */
const readPendingStatus = async (gateError: HttpError): Promise<DbStatus> => {
  try {
    const status = await systemTransport.status()

    // The gate's rejection already carried the docs link, so prefer whichever
    // source has one. Taking the status response wholesale dropped the link
    // from the screen entirely.
    return { ...status, problem: status.problem ?? gateError.problem, docsUrl: status.docsUrl ?? gateError.docsUrl }
  } catch {
    return { state: 'PENDING_IMPORT', problem: gateError.problem, docsUrl: gateError.docsUrl }
  }
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) throw new Error('useSettings must be used within SettingsProvider')

  return context
}
