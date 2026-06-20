import { Routes, Route, Navigate } from 'react-router-dom'

// Páginas
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import DashboardCliente from '../pages/cliente/DashboardCliente'
import AgendaGeneral from '../pages/recepcion/AgendaGeneral'
import Dashboard from '../pages/admin/Dashboard'
import GestionServicios from '../pages/admin/GestionServicios'
import GestionUsuarios from '../pages/admin/GestionUsuarios'
import AgendaMedico from '../pages/especialista/AgendaMedico' 
import FichaClinica from '../pages/especialista/FichaClinica' 
import BuscarPaciente from '../pages/especialista/BuscarPaciente'
import Disponibilidad from '../pages/especialista/Disponibilidad'
import Perfil from '../pages/especialista/Perfil'

// Layout y Seguridad
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* RUTA ADMINISTRADOR */}
      <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/servicios" element={<GestionServicios />} />
          <Route path="/admin/usuarios" element={<GestionUsuarios />} />
        </Route>
      </Route>

      {/* RUTA ESPECIALISTA */}
      <Route element={<ProtectedRoute allowedRoles={['Especialista']} />}>
        <Route element={<MainLayout />}>
          <Route path="/especialista/agenda" element={<AgendaMedico />} />
          <Route path="/especialista/buscar-paciente" element={<BuscarPaciente />} />
          <Route path="/especialista/disponibilidad" element={<Disponibilidad />} />
          <Route path="/especialista/ficha/:id_cliente" element={<FichaClinica />} />
          <Route path="/especialista/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* RUTA CLIENTE */}
      <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
        <Route element={<MainLayout />}>
          <Route path="/cliente/dashboard" element={<DashboardCliente />} />
        </Route>
      </Route>

      {/* RUTA RECEPCIÓN */}
      <Route element={<ProtectedRoute allowedRoles={['Recepcion', 'Recepción']} />}>
        <Route element={<MainLayout />}>
          <Route path="/recepcion/agenda" element={<AgendaGeneral />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}