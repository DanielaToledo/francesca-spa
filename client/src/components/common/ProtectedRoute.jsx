import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  // Mientras el contexto está leyendo el localStorage (en el F5), mostramos una pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Verificando credenciales...</p>
      </div>
    )
  }

  // 🛡️ LA SEGURIDAD: Si no hay usuario logueado en el sistema, lo rebotamos al Login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si está logueado, lo dejamos pasar a las páginas protegidas
  return <Outlet />
}