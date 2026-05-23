import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface RouteGuardProps {
  redirectWhen: boolean
  redirectTo: string
  element: ReactNode
}

export const RouteGuard = ({ redirectWhen, redirectTo, element }: RouteGuardProps) => {
  if (redirectWhen) return <Navigate to={redirectTo} replace />

  return <>{element}</>
}
