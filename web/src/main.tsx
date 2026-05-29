import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Theme } from '@/theme'
import { AppRoutes } from '@/routes'
import { SettingsProvider } from '@/contexts/settings-context'
import { Toaster } from '@/components/4-templates/sonner'

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
