import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import DashboardCliente from '../pages/cliente/DashboardCliente'
import AgendaGeneral from '../pages/recepcion/AgendaGeneral'
import Dashboard from '../pages/admin/Dashboard' // <--- Tu archivo de métricas
import GestionServicios from '../pages/admin/GestionServicios' // <--- Tu archivo de servicios
import GestionUsuarios from '../pages/admin/GestionUsuarios'
import AgendaMedico from '../pages/especialista/AgendaMedico' 
import FichaClinica from '../pages/especialista/FichaClinica' 
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import BuscarPaciente from '../pages/especialista/BuscarPaciente'
import Disponibilidad from '../pages/especialista/Disponibilidad'
import Perfil from '../pages/especialista/Perfil'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* AQUÍ ESTÁ EL CAMBIO: Al entrar al layout, redirige automáticamente a tu Dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Rutas Admin */}
          <Route path="/admin/dashboard" element={<Dashboard />} /> 
          <Route path="/admin/servicios" element={<GestionServicios />} />
          <Route path="/admin/usuarios" element={<GestionUsuarios />} />
          
          {/* Cliente y Recepción */}
          <Route path="/cliente/dashboard" element={<DashboardCliente />} />
          <Route path="/recepcion/agenda" element={<AgendaGeneral />} />
          
          {/* Especialista */}
          <Route path="/especialista/agenda" element={<AgendaMedico />} />
          <Route path="/especialista/buscar-paciente" element={<BuscarPaciente />} />
          <Route path="/especialista/disponibilidad" element={<Disponibilidad />} />
          <Route path="/especialista/ficha/:id_cliente" element={<FichaClinica />} />
          <Route path="/especialista/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}