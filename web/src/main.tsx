import './index.css'

import { createRoot } from 'react-dom/client'

import { StrictMode } from 'react'
import { SettingsProvider } from '@/contexts/settings-context'
import { Toaster } from '@/components/sonner'
import { AppRoutes } from '@/routes'

const App = () => (
  <StrictMode>
    <SettingsProvider>
      <AppRoutes />
      <Toaster />
    </SettingsProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
