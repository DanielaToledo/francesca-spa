import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/Api';
import { HelpCircle, CheckCircle2, X, Loader2, Trash2 } from 'lucide-react';

export default function SelectorHorarios({ fecha, id_especialista }) {
    const horasDisponibles = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [turnosDelDia, setTurnosDelDia] = useState([]);

    // Estados para Modales
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, type: '', message: '' });
    
    // Estado para saber qué horario estamos intentando desbloquear
    const [idBloqueoADesbloquear, setIdBloqueoADesbloquear] = useState(null);

    const toggleHora = (hora) => {
        setHorasSeleccionadas(prev =>
            prev.includes(hora) ? prev.filter(h => h !== hora) : [...prev, hora]
        );
    };

    const cargarBloqueos = async () => {
        try {
            if (!id_especialista) return;
            const { data } = await api.get(`/bloqueos/${id_especialista}`);
            const fechaStr = format(fecha, 'yyyy-MM-dd');
            const bloqueosDia = data.data
                .filter(b => b.fecha_inicio.startsWith(fechaStr))
                .map(b => ({ hora: format(new Date(b.fecha_inicio), 'HH:mm'), id_bloqueo: b.id_bloqueo }));
            setHorariosOcupados(bloqueosDia);
        } catch (error) { console.error("Error al cargar bloqueos:", error); }
    };

    const cargarResumenAgenda = async () => {
        try {
            if (!id_especialista) return;
            const fechaStr = format(fecha, 'yyyy-MM-dd');
            const { data } = await api.get(`/turnos/agenda/resumen/${id_especialista}?fecha=${fechaStr}`);
            setTurnosDelDia(data.data.turnos);
        } catch (error) { console.error("Error al traer el resumen:", error); }
    };

    useEffect(() => { cargarBloqueos(); cargarResumenAgenda(); }, [fecha, id_especialista]);

    // LÓGICA DE BLOQUEO
    const handleConfirmarBloqueo = async () => {
        setLoading(true);
        try {
            const fechaStr = format(fecha, 'yyyy-MM-dd');
            for (const hora of horasSeleccionadas) {
                await api.post('/bloqueos', { id_especialista, fecha_inicio: `${fechaStr} ${hora}:00`, fecha_fin: `${fechaStr} ${parseInt(hora) + 1}:00`, motivo: "Bloqueo manual" });
            }
            setShowConfirm(false);
            setStatusModal({ show: true, type: 'success', message: '¡Horarios bloqueados con éxito!' });
            setHorasSeleccionadas([]);
            cargarBloqueos();
        } catch (error) {
            setShowConfirm(false);
            setStatusModal({ show: true, type: 'error', message: 'Error: ' + (error.response?.data?.message || 'No se pudieron bloquear.') });
        } finally { setLoading(false); }
    };

    // LÓGICA DE DESBLOQUEO (RECUPERADA)
    const handleDesbloquear = async (id_bloqueo) => {
        setLoading(true);
        try {
            await api.delete(`/bloqueos/${id_bloqueo}`);
            setStatusModal({ show: true, type: 'success', message: '¡Horario liberado con éxito!' });
            cargarBloqueos();
        } catch (error) {
            setStatusModal({ show: true, type: 'error', message: 'No se pudo desbloquear el horario.' });
        } finally {
            setLoading(false);
            setIdBloqueoADesbloquear(null);
        }
    };

    const closeAllModals = () => { setShowConfirm(false); setStatusModal({ show: false, type: '', message: '' }); setIdBloqueoADesbloquear(null); };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A87379]/10">
            {/* MODALES */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl swal-animation">
                        <div className="flex items-center gap-3 mb-4 text-[#A87379]">
                            <HelpCircle size={24} />
                            <h3 className="text-xl font-bold">Confirmar Bloqueo</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">¿Estás seguro de bloquear {horasSeleccionadas.length} horarios?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">Cancelar</button>
                            <button onClick={handleConfirmarBloqueo} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-[#A87379] text-white font-bold text-sm flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {statusModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl swal-animation flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
                        <div className={statusModal.type === 'success' ? "bg-[#E8F5E9] text-[#2E7D32] p-5 rounded-full mb-6" : "bg-red-50 text-red-600 p-5 rounded-full mb-6"}>
                            {statusModal.type === 'success' ? <CheckCircle2 size={50} /> : <X size={50} />}
                        </div>
                        <h3 className={`text-3xl font-extrabold mb-3 ${statusModal.type === 'success' ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                            {statusModal.type === 'success' ? '¡Éxito!' : 'Error'}
                        </h3>
                        <p className="text-slate-700 mb-8">{statusModal.message}</p>
                        <button onClick={closeAllModals} className={`w-full py-3.5 rounded-xl text-white font-bold ${statusModal.type === 'success' ? 'bg-[#2E7D32]' : 'bg-red-600'}`}>Aceptar</button>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-bold text-[#A87379] mb-4">Horarios para {format(fecha, 'dd/MM/yyyy')}</h3>
            
            <div className="grid grid-cols-3 gap-3">
                {horasDisponibles.map((hora) => {
                    const ocupado = horariosOcupados.find(h => h.hora === hora);
                    return (
                        <button key={hora} 
                            onClick={() => ocupado ? handleDesbloquear(ocupado.id_bloqueo) : toggleHora(hora)}
                            className={`py-2 px-3 rounded-lg border text-sm transition flex flex-col items-center ${
                                ocupado 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500' 
                                : horasSeleccionadas.includes(hora) 
                                    ? 'bg-[#A87379] text-white border-[#A87379]' 
                                    : 'bg-white border-[#A87379]/30 hover:border-[#A87379]'
                            }`}>
                            <span className="font-bold">{hora}</span>
                            {ocupado && <span className="text-[9px] font-bold uppercase mt-1">Liberar</span>}
                        </button>
                    );
                })}
            </div>
            
            <button onClick={() => setShowConfirm(true)} disabled={horasSeleccionadas.length === 0 || loading}
                className="mt-6 w-full py-3 bg-[#A87379] text-white font-bold rounded-lg hover:bg-[#96666b] transition">
                Confirmar Bloqueos
            </button>

            {/* LISTA DE TURNOS */}
            <div className="mt-8 border-t pt-6">
                <h4 className="font-bold text-slate-700 mb-3">Turnos agendados</h4>
                {turnosDelDia.length > 0 ? (
                    <div className="space-y-2">
                        {turnosDelDia.map(turno => (
                            <div key={turno.id_turno} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm transition-all">
                                <span className="font-bold text-blue-800">{format(new Date(turno.fecha_hora), 'HH:mm')}</span>
                                <span className="text-slate-700 font-medium">{turno.cliente_nombre}</span>
                                <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full uppercase">{turno.nombre_estado}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic text-center">No hay turnos para este día.</p>
                )}
            </div>
        </div>
    );
}