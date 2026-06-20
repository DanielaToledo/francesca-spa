import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Scissors,
    Calendar,
    UserSearch,
    Settings,
    LogOut,
    ClipboardList,
    PlusCircle
} from 'lucide-react';

export default function Sidebar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-full md:w-64 h-screen bg-[#FBF9F8] text-slate-700 flex flex-col border-r border-[#F4CFCC]/40">

            {/* Contenedor con scroll: aquí va todo el contenido dinámico */}
            <div className="flex-1 overflow-y-auto">
                {/* Logo */}
                <div className="p-6 border-b border-[#F4CFCC]/30">
                    <h1 className="text-xl font-bold text-[#A87379] tracking-wide">Spa Francesca</h1>
                </div>

                {/* Perfil Usuario */}
                <div className="p-4 mx-4 my-4 bg-white rounded-xl border border-[#F4CFCC]/40 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Conectado como</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.nombre} {user?.apellido}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#EAA0AB]/10 text-[#A87379] border border-[#EAA0AB]/20 text-xs rounded-md font-semibold">
                        {user?.rol}
                    </span>
                </div>

                {/* Menú de Navegación */}
                <nav className="px-4 space-y-1">
                    {/* 1. ADMINISTRADOR */}
                    {(user?.rol === 'Administrador' || user?.rol === 'Admin') && (
                        <>
                            <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/dashboard') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <LayoutDashboard size={18} /> Panel Principal
                            </Link>
                            <Link to="/admin/usuarios" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/usuarios') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <Users size={18} /> Gestión Personal
                            </Link>
                            <Link to="/admin/servicios" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/servicios') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <Scissors size={18} /> Gestión Servicios
                            </Link>
                        </>
                    )}

                    {/* 2. ESPECIALISTA */}
                    {user?.rol === 'Especialista' && (
                        <>
                            <Link to="/especialista/agenda" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/agenda') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <Calendar size={18} /> Mi Agenda
                            </Link>
                            <Link to="/especialista/buscar-paciente" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/buscar-paciente') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <UserSearch size={18} /> Buscar Paciente
                            </Link>
                            <Link to="/especialista/disponibilidad" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/especialista/disponibilidad') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <Settings size={18} /> Disponibilidad
                            </Link>
                            <Link
                                to="/especialista/perfil"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg 
    ${isActive('/especialista/perfil')
                                        ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold'
                                        : 'hover:bg-white text-slate-600'
                                    }`}
                            >
                                <Settings size={18} /> Mi Configuración
                            </Link>
                        </>
                    )}

                    {/* 3. CLIENTE */}
                    {user?.rol === 'Cliente' && (
                        <>
                            <Link to="/cliente/dashboard" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/cliente/dashboard') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <ClipboardList size={18} /> Mis Turnos
                            </Link>
                            <Link to="/cliente/reservar" className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${isActive('/cliente/reservar') ? 'bg-[#F4CFCC]/60 text-[#A87379] font-bold' : 'hover:bg-white text-slate-600'}`}>
                                <PlusCircle size={18} /> Reservar Turno
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            {/* Botón Salir: Fijo al final del Sidebar */}
            <div className="p-4 border-t border-[#F4CFCC]/30 bg-[#FBF9F8] shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all cursor-pointer border border-red-700"
                >
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}