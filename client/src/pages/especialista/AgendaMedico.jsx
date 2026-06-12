import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { turnoService } from '../../services/turnoService'
import { ESTADOS_TURNO } from "../../constants/estadoTurno";

export default function AgendaMedico() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [turnos, setTurnos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        const obtenerTurnosEspecialista = async () => {
            const idParaConsultar = user?.id_especialista || user?.id_usuario;
            if (!idParaConsultar) return;

            try {
                setLoading(true)
                setError(null)

                const res = await turnoService.getTurnosEspecialista(idParaConsultar)

                if (res.success) {
                    // Mantenemos este log para depuración, si ves que llegan los datos aquí, ¡es un gol!

                    console.log("Datos recibidos del servidor:", JSON.stringify(res.data, null, 2));

                    // MEJORA: Comparación más robusta de fechas
                    const turnosFiltrados = res.data.filter(turno => {
                        if (!turno.fecha_hora) return false;
                        const fechaTurno = new Date(turno.fecha_hora).toISOString().split('T')[0];
                        return fechaTurno === filtroFecha;
                    });

                    setTurnos(turnosFiltrados)
                } else {
                    setError('No se pudieron obtener los turnos.')
                }
            } catch (err) {
                console.error("Error al cargar la agenda:", err)
                setError('No se pudo cargar la agenda real del día.')
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            obtenerTurnosEspecialista()
        }
    }, [user, filtroFecha])

    const formatHora = (fechaHoraString) => {
        try {
            // Creamos un objeto fecha a partir del string
            const fecha = new Date(fechaHoraString);

            // Usamos UTC para obtener las horas y minutos EXACTOS que están en la base de datos
            const horas = fecha.getUTCHours().toString().padStart(2, '0');
            const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');

            return `${horas}:${minutos}`;
        } catch {
            return '00:00'
        }
    }

    const getEstadoBadge = (id_estado) => {
        // Convertimos a número para asegurar la comparación
        const id = parseInt(id_estado);

        if (id === ESTADOS_TURNO.REALIZADO) return 'bg-[#A87379]/10 text-[#A87379] border-[#A87379]/20';
        if (id === ESTADOS_TURNO.PENDIENTE) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (id === ESTADOS_TURNO.CANCELADO) return 'bg-red-50 text-red-700 border-red-200';
        if (id === ESTADOS_TURNO.AUSENTE) return 'bg-slate-100 text-slate-600 border-slate-200';

        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    return (
        <div className="space-y-8 bg-[#FBF9F8] p-6 rounded-2xl min-h-[85vh]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#A87379] tracking-tight">
                        ¡Hola, {user?.nombre || 'Especialista'}! ✨
                    </h2>
                    <p className="text-slate-500 mt-1">Acá tenés el control de tus citas y pacientes asignados.</p>
                </div>

                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Ver Día:</span>
                    <input
                        type="date"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-[#A87379] text-lg">Cronograma de Citas</h3>
                    <span className="px-2.5 py-1 bg-[#F4CFCC]/40 text-[#A87379] text-xs font-bold rounded-full">
                        {turnos.length} Turnos
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-sm font-medium">Cargando agenda...</div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500 text-sm font-medium">{error}</div>
                ) : turnos.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                        No tenés turnos para esta fecha ({filtroFecha}).
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FBF9F8]/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 pl-6">Hora</th>
                                    <th className="p-4">Clienta</th>
                                    <th className="p-4">Tratamiento</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {turnos.map((turno) => (
                                    <tr key={turno.id_turno} className="hover:bg-[#FBF9F8]/50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-[#A87379] text-base">{formatHora(turno.fecha_hora)} hs</td>
                                        <td className="p-4 font-semibold text-slate-800">{turno.cliente_nombre}</td>
                                        <td className="p-4 text-slate-600 font-medium">{turno.nombre_servicio}</td>
                                        <td className="p-4 text-center">
                                            
                                            <span className={`... ${getEstadoBadge(turno.id_estado_turno)}`}>
                                                {turno.nombre_estado || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => navigate(`/especialista/ficha/${turno.id_cliente}`, {
                                                    state: { id_turno: turno.id_turno } // <--- ¡AQUÍ ESTÁ EL SECRETO!
                                                })}
                                                className="px-3 py-1.5 text-xs font-bold text-[#A87379] bg-[#F4CFCC]/40 hover:bg-[#F4CFCC]/70 border border-[#F4CFCC]/60 rounded-lg transition-all"
                                            >
                                                📝 Ver Ficha
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}