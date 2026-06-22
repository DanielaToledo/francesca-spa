import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layout y Seguridad
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Spinner from '../components/common/Spinner'; // <-- Importamos tu spinner

// Importaciones con lazy (Perezosas)
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const DashboardCliente = lazy(() => import('../pages/cliente/DashboardCliente'));
const AgendaGeneral = lazy(() => import('../pages/recepcion/AgendaGeneral'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const GestionServicios = lazy(() => import('../pages/admin/GestionServicios'));
const GestionUsuarios = lazy(() => import('../pages/admin/GestionUsuarios'));
const AgendaMedico = lazy(() => import('../pages/especialista/AgendaMedico'));
const FichaClinica = lazy(() => import('../pages/especialista/FichaClinica'));
const BuscarPaciente = lazy(() => import('../pages/especialista/BuscarPaciente'));
const Disponibilidad = lazy(() => import('../pages/especialista/Disponibilidad'));
const Perfil = lazy(() => import('../pages/especialista/Perfil'));

export default function AppRoutes() {
  return (
    // Suspense envuelve todo el sistema de rutas para mostrar el spinner durante la carga
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Administrador */}
        <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/servicios" element={<GestionServicios />} />
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
          </Route>
        </Route>

        {/* Especialista */}
        <Route element={<ProtectedRoute allowedRoles={['Especialista']} />}>
          <Route element={<MainLayout />}>
            <Route path="/especialista/agenda" element={<AgendaMedico />} />
            <Route path="/especialista/buscar-paciente" element={<BuscarPaciente />} />
            <Route path="/especialista/disponibilidad" element={<Disponibilidad />} />
            <Route path="/especialista/ficha/:id_cliente" element={<FichaClinica />} />
            <Route path="/especialista/perfil" element={<Perfil />} />
          </Route>
        </Route>

        {/* Cliente */}
        <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
          <Route element={<MainLayout />}>
            <Route path="/cliente/dashboard" element={<DashboardCliente />} />
          </Route>
        </Route>

        {/* Recepción */}
        <Route element={<ProtectedRoute allowedRoles={['Recepcion', 'Recepción']} />}>
          <Route element={<MainLayout />}>
            <Route path="/recepcion/agenda" element={<AgendaGeneral />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}