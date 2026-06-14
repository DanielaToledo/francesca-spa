import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'


export default function Sidebar() {
    const { user, logoutUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation() // Para saber en qué pestaña estamos

    const handleLogout = () => {
        logoutUser()
        navigate('/login')
    }

    // Función para marcar el botón activo en el menú
    const isActive = (path) => location.pathname === path

    return (
        // 🌌 SOLUCIÓN: Agregamos h-screen (o min-h-screen) para obligarlo a estirarse hasta el piso de la pantalla
        <aside className="w-full md:w-64 min-h-screen bg-[#FBF9F8] text-slate-700 flex flex-col border-r border-[#F4CFCC]/40 justify-between">

            {/* Contenedor superior para el logo, perfil y navegación */}
            <div className="flex flex-col flex-1">
                {/* Encabezado / Logo */}
                <div className="p-6 border-b border-[#F4CFCC]/30">
                    <h1 className="text-xl font-bold text-[#A87379] tracking-wide">Spa Francesca</h1>
                </div>

                {/* Perfil del Usuario Conectado - Fondo blanco puro */}
                <div className="p-4 mx-4 my-4 bg-white rounded-xl border border-[#F4CFCC]/40 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Conectado como</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.nombre} {user?.apellido}</p>

                    {/* Etiqueta de Rol usando tu rosa intermedio */}
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#EAA0AB]/10 text-[#A87379] border border-[#EAA0AB]/20 text-xs rounded-md font-semibold">
                        {user?.rol}
                    </span>
                </div>

                {/* Menú de Navegación Dinámico según el Rol */}
                <nav className="px-4 space-y-1">

                    {/* 1. CASO ADMINISTRADOR */}
                    {(user?.rol === 'Administrador' || user?.rol === 'Admin') && (
                        <>
                            <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/dashboard') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                ✨ Gestionar Servicios
                            </Link>
                            <Link to="/admin/usuarios" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/usuarios') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                👥 Gestionar Personal
                            </Link>
                        </>
                    )}

                    {/* 2. CASO ESPECIALISTA (Aquí agregamos lo que necesitaba Melani) */}
                    {user?.rol === 'Especialista' && (
                        <>
                            <Link to="/especialista/agenda" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/agenda') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                📅 Mi Agenda Citas
                            </Link>
                            <Link to="/especialista/buscar-paciente" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/buscar-paciente') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                🔍 Buscar Paciente
                            </Link>
                            <Link
                                to="/especialista/disponibilidad"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/disponibilidad') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}
                            >
                                📅 Gestión de Disponibilidad
                            </Link>
{/* NUEVA OPCIÓN */}
        <Link
            to="/especialista/perfil"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/perfil') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}
        >
            ⚙️ Mi Configuración
        </Link>
                        </>
                    )}

                    {/* 3. CASO CLIENTE */}
                    {user?.rol === 'Cliente' && (
                        <>
                            <Link to="/cliente/dashboard" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/cliente/dashboard') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                💆‍♀️ Mis Turnos
                            </Link>
                            <Link to="/cliente/reservar" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/cliente/reservar') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                📅 Reservar Turno
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            {/* 🛑 Botón de Salida - Empujado hacia abajo del todo de forma segura */}
            <div className="p-4 border-t border-[#F4CFCC]/30 bg-[#FBF9F8]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all cursor-pointer border border-red-700"
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}