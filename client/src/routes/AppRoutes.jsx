import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import DashboardCliente from '../pages/cliente/DashboardCliente'
import AgendaGeneral from '../pages/recepcion/AgendaGeneral'
import PanelControl from '../pages/admin/PanelControl'
import GestionUsuarios from '../pages/admin/GestionUsuarios'
import AgendaMedico from '../pages/especialista/AgendaMedico' 
// 🚀 IMPORTAMOS LA NUEVA PÁGINA
import FichaClinica from '../pages/especialista/FichaClinica' 
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import BuscarPaciente from '../pages/especialista/BuscarPaciente';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/cliente/dashboard" element={<DashboardCliente />} />
          <Route path="/recepcion/agenda" element={<AgendaGeneral />} />
          <Route path="/admin/dashboard" element={<PanelControl />} />
          <Route path="/admin/usuarios" element={<GestionUsuarios />} />
          
          {/* Agenda del Especialista */}
          <Route path="/especialista/agenda" element={<AgendaMedico />} />
          <Route path="/especialista/buscar-paciente" element={<BuscarPaciente />} />
          
          {/* 📂 NUEVA RUTA: Ficha Clínica por ID de Cliente */}
          <Route path="/especialista/ficha/:id_cliente" element={<FichaClinica />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}