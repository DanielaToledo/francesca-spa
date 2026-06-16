import { useState, useEffect } from 'react';
import API from '../../services/api'; // Asegúrate de que esta ruta sea correcta
import { Calendar, Users, DollarSign, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        citasHoy: 0,
        personalActivo: 0,
        ingresosDia: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Aquí usamos AXIOS para traer tus datos
                // const response = await API.get('/dashboard/stats');
                // setStats(response.data);
                
                // Simulación de carga mientras conectas tus endpoints
                setTimeout(() => {
                    setStats({ citasHoy: 12, personalActivo: 8, ingresosDia: 145000 });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error al cargar métricas:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-[#A87379]" size={40} />
        </div>
    );

    return (
        <div className="p-2 md:p-6 space-y-8">
            {/* Saludo */}
            <div>
                <h1 className="text-3xl font-bold text-[#A87379]">Bienvenida, Daniela</h1>
                <p className="text-slate-500">Aquí tienes el resumen de la actividad del Spa hoy.</p>
            </div>
            
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Citas Hoy" 
                    value={stats.citasHoy} 
                    icon={<Calendar className="text-[#A87379]" size={24} />} 
                />
                <StatCard 
                    title="Personal Activo" 
                    value={stats.personalActivo} 
                    icon={<Users className="text-[#A87379]" size={24} />} 
                />
                <StatCard 
                    title="Ingresos del Día" 
                    value={`$${stats.ingresosDia.toLocaleString()}`} 
                    icon={<DollarSign className="text-[#A87379]" size={24} />} 
                />
            </div>

            {/* Accesos Rápidos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-[#A87379] text-white py-3 rounded-xl font-bold hover:bg-[#96666b] transition-all">
                        <Calendar size={18} /> Nueva Cita
                    </button>
                    <button className="flex items-center justify-center gap-2 border-2 border-[#A87379] text-[#A87379] py-3 rounded-xl font-bold hover:bg-[#F4CFCC]/20 transition-all">
                        <Users size={18} /> Gestionar Personal
                    </button>
                </div>
            </div>
        </div>
    );
}

// Sub-componente para las tarjetas
function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h2 className="text-3xl font-bold text-slate-800 mt-1">{value}</h2>
            </div>
            <div className="p-3 bg-[#F4CFCC]/20 rounded-xl">
                {icon}
            </div>
        </div>
    );
}