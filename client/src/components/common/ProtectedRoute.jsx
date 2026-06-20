import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import API from '../../services/api'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, logoutUser } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('spa_token')
      
      if (!token) {
        setIsAuthorized(false)
        setChecking(false)
        return
      }

      try {
        await API.get('/auth/validate')
        setIsAuthorized(true)
      } catch (error) {
        logoutUser()
        setIsAuthorized(false)
      } finally {
        setChecking(false)
      }
    }
    verifyToken()
  }, [logoutUser])

  if (loading || checking) return <div>Validando seguridad...</div>

  // 1. Si no hay usuario o no pasó la validación del backend, login
  if (!user || !isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. NUEVA VALIDACIÓN: Si el rol del usuario no está en allowedRoles, denegar acceso
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard según su rol real para evitar bucles
    return <Navigate to={`/${user.rol.toLowerCase()}/dashboard`} replace />
  }

  // Si todo está bien, mostrar la página
  return <Outlet />
}