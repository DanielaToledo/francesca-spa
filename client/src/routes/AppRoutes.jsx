import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import DashboardCliente from '../pages/cliente/DashboardCliente'
import AgendaGeneral from '../pages/recepcion/AgendaGeneral'
import PanelControl from '../pages/admin/PanelControl'
import GestionUsuarios from '../pages/admin/GestionUsuarios'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔓 RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔒 RUTAS PRIVADAS (Envueltas por el Patovica) */}
      <Route element={<ProtectedRoute />}>
        {/* Dentro del patovica, metemos el Layout con la Sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="/cliente/dashboard" element={<DashboardCliente />} />
          <Route path="/recepcion/agenda" element={<AgendaGeneral />} />
          <Route path="/admin/dashboard" element={<PanelControl />} />
          <Route path="/admin/usuarios" element={<GestionUsuarios />} />
        </Route>
      </Route>

      {/* 🍏 COMODÍN */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}