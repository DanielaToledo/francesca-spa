import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const { user, logoutUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation() // Para saber en qué pestaña estamos y pintarla de azul

    const handleLogout = () => {
        logoutUser()
        navigate('/login')
    }

    // Función para marcar el botón activo en el menú
    const isActive = (path) => location.pathname === path

    return (
        <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
            {/* Encabezado / Logo */}
            {/* Encabezado / Logo */}
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white tracking-wide">Spa Francesca 💆‍♀️</h1>
            </div>

            {/* Perfil del Usuario Conectado */}
            <div className="p-4 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Conectado como</p>
                <p className="text-sm font-bold text-white truncate">{user?.nombre} {user?.apellido}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs rounded-md font-medium">
                    {user?.rol}
                </span>
            </div>

            {/* Menú de Navegación Dinámico según el Rol */}
          {/* Menú de Navegación Dinámico según el Rol */}
<nav className="flex-1 px-4 space-y-1">
    {user?.rol === 'Administrador' || user?.rol === 'Admin' ? (
        <>
            {/* Links para el Administrador */}
            <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/admin/dashboard') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
                💆‍♂️ Gestionar Servicios
            </Link>
            
            <Link
                to="/admin/usuarios"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/admin/usuarios') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
                👥 Gestionar Personal
            </Link>
        </>
    ) : (
        <>
            {/* Links para el Cliente */}
            <Link
                to="/cliente/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/cliente/dashboard') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
                ✨ Mis Turnos
            </Link>
            <Link
                to="/cliente/reservar"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/cliente/reservar') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
                📅 Reservar Turno
            </Link>
        </>
    )}
</nav>

            {/* Botón de Salida al fondo */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all cursor-pointer"
                >
                    🛑 Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}