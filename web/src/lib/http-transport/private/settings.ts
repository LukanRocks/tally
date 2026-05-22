import { perform, request } from '../helpers'

export interface Settings {
  onboarded: 0 | 1
  currency: 'USD' | 'BRL'
  language: 'en' | 'pt'
  default_owner_id?: number
  theme: 'light' | 'dark' | 'system'
  bgg_last_updated?: string
  updated_at: string
}

/** @internal Use via SettingsContext only  — do not import directly in components. */
export const settingsTransport = {
  get: () => perform<Settings>('/settings'),
  update: (data: Partial<Omit<Settings, 'updated_at'>>) => perform<Settings>('/settings', request('PUT', data)),
  reset: () => perform<void>('/settings/reset', { method: 'DELETE' }),
}
