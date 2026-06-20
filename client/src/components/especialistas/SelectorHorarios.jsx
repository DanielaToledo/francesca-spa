
// este componente es el encargado de mostrar los horarios disponibles para un día seleccionado,
// y de permitir bloquear o desbloquear horas específicas. También muestra los turnos agendados para ese día. Recibe la fecha, el id del especialista y la configuración de horarios como props.

import { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import api from '../../services/api'; // Asegúrate que el archivo sea api.js (minúsculas)
import { X, Loader2, CalendarX2 } from 'lucide-react';

export default function SelectorHorarios({ fecha, id_especialista, configuracion, onActualizar }) {
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [turnosDelDia, setTurnosDelDia] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const diaIngles = format(fecha, 'EEEE').toLowerCase();
    const mapaDias = {
        monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves',
        friday: 'viernes', saturday: 'sabado', sunday: 'domingo'
    };
    const nombreDia = mapaDias[diaIngles] || diaIngles;
    const configDia = configuracion?.horarios?.[nombreDia] || null;
    const fechaStr = format(fecha, 'yyyy-MM-dd');

    const esDiaBloqueado = configuracion?.bloqueos?.some(b => b.fecha === fechaStr);

    const generarHoras = () => {
        if (esDiaBloqueado || !configDia || !configDia.inicio || !configDia.fin) return [];
        const { inicio, fin, intervalo } = configDia;
        let lista = [];
        let actual = parse(inicio, 'HH:mm', new Date(2000, 0, 1));
        const limite = parse(fin, 'HH:mm', new Date(2000, 0, 1));

        while (actual < limite) {
            lista.push(format(actual, 'HH:mm'));
            actual = addMinutes(actual, intervalo);
        }
        return lista;
    };

    const horasDisponibles = generarHoras();

    const cargarDatos = async () => {
        if (!id_especialista || !fecha) return;
        try {
            // Usamos 'api' que ya tiene el interceptor de seguridad
            const { data: bRes } = await api.get(`/bloqueos/${id_especialista}`);
            const bloqueosDelDia = (bRes.data || []).filter(b => b.fecha_inicio.startsWith(fechaStr));
            setHorariosOcupados(bloqueosDelDia);

            const { data: tData } = await api.get(`/turnos/agenda/resumen/${id_especialista}`);
            const todosLosTurnos = tData.data.turnos || [];
            const turnosFiltrados = todosLosTurnos.filter(turno => turno.fecha_hora.startsWith(fechaStr));
            setTurnosDelDia(turnosFiltrados);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMsg("No se pudieron cargar los datos.");
        }
    };

    useEffect(() => { cargarDatos(); }, [fecha, id_especialista]);

    const toggleHora = (hora) => {
        setHorasSeleccionadas(prev => prev.includes(hora) ? prev.filter(h => h !== hora) : [...prev, hora]);
    };

    const handleConfirmarBloqueo = async () => {
        setLoading(true);
        try {
            const intervalo = configDia.intervalo || 60;
            await Promise.all(horasSeleccionadas.map(async (hora) => {
                const inicio = `${fechaStr} ${hora}:00`; 
                
                const [h, m] = hora.split(':').map(Number);
                const total = (h * 60) + m + intervalo;
                const fin = `${fechaStr} ${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}:00`;

                return api.post('/bloqueos', { 
                    id_especialista, 
                    fecha_inicio: inicio, 
                    fecha_fin: fin, 
                    motivo: "Bloqueo manual" 
                });
            }));

            await cargarDatos();
            setHorasSeleccionadas([]);
            setShowConfirm(false);
            if (onActualizar) onActualizar();
        } catch (error) {
            setErrorMsg("Error al guardar los bloqueos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDesbloquear = async (id_bloqueo) => {
        setLoading(true);
        try {
            await api.delete(`/bloqueos/${id_bloqueo}`);
            await cargarDatos();
            if (onActualizar) onActualizar();
        } catch (error) {
            setErrorMsg("Error al eliminar el bloqueo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A87379]/10">
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex justify-between items-center">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)}><X size={16} /></button>
                </div>
            )}

            <h3 className="text-lg font-bold text-[#A87379] mb-4">Horarios para {format(fecha, 'dd/MM/yyyy')}</h3>

            {esDiaBloqueado ? (
                <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center flex flex-col items-center my-4">
                    <CalendarX2 size={24} className="text-red-600 mb-3" />
                    <p className="text-red-700 font-bold">Día bloqueado</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {horasDisponibles.map((hora) => {
                        const bloqueo = horariosOcupados.find(b => b.fecha_inicio.substring(11, 16) === hora);
                        return (
                            <button
                                key={hora}
                                onClick={() => bloqueo ? handleDesbloquear(bloqueo.id_bloqueo) : toggleHora(hora)}
                                className={`py-2 px-3 rounded-lg border text-sm transition flex flex-col items-center ${
                                    bloqueo 
                                        ? 'bg-red-50 border-red-200 text-red-600'
                                        : horasSeleccionadas.includes(hora) 
                                            ? 'bg-[#A87379] text-white border-[#A87379]'
                                            : 'bg-white border-[#A87379]/30 hover:border-[#A87379]'
                                }`}
                            >
                                <span className="font-bold">{hora}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {!esDiaBloqueado && (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={horasSeleccionadas.length === 0 || loading}
                    className="mt-6 w-full py-3 bg-[#A87379] text-white font-bold rounded-lg hover:bg-[#96666b] disabled:opacity-50 transition"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Bloqueos'}
                </button>
            )}

            <div className="mt-8 border-t pt-6">
                <h4 className="font-bold text-slate-700 mb-3">Turnos agendados</h4>
                {turnosDelDia.length > 0 ? turnosDelDia.map(turno => (
                    <div key={turno.id_turno} className="flex justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm mb-2">
                        <span className="font-bold text-blue-800">{turno.fecha_hora.substring(11, 16)}</span>
                        <span className="text-slate-700">{turno.cliente_nombre}</span>
                    </div>
                )) : <p className="text-sm text-slate-400 italic">No hay turnos agendados.</p>}
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold mb-4">¿Confirmar bloqueos?</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-slate-100 rounded-lg">No</button>
                            <button onClick={handleConfirmarBloqueo} className="flex-1 py-2 bg-[#A87379] text-white rounded-lg">Sí</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}