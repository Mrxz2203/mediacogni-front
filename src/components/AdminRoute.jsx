import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user } = useAuth()

  // Sin sesión → al login
  if (!user) return <Navigate to="/login" replace />

  // Con sesión pero no es admin → al inicio (no tiene permisos)
  if (user.rol !== 'admin') return <Navigate to="/inicio" replace />

  return children
}