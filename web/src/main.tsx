import './index.css'

import { createRoot } from 'react-dom/client'

import { StrictMode } from 'react'
import { SettingsProvider } from '@/contexts/settings-context'
import { Toaster } from '@/components/feedback/sonner'
import { AppRoutes } from '@/routes'
import { Theme } from '@/components/theme/theme'

const App = () => (
  <StrictMode>
    <SettingsProvider>
      <Theme />
      <AppRoutes />
      <Toaster />
    </SettingsProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
