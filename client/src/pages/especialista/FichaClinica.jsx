import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { evolucionService } from '../../services/evolucionService';
import { HelpCircle, CheckCircle2, X, Loader2, ClipboardCheck } from 'lucide-react';

export default function FichaClinica() {
    const { id_cliente } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const id_turno_recibido = location.state?.id_turno || null; 

    const [notas, setNotas] = useState('');
    const [productos, setProductos] = useState('');
    const [recomendaciones, setRecomendaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [nombreCliente, setNombreCliente] = useState('Cargando...');
    
    // NUEVO: Estado para saber si estamos editando el turno actual
    const [evolucionActual, setEvolucionActual] = useState(null);

    // Estados para Modales
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, type: '', message: '' });

    const cargarDatos = async () => {
        try {
            const resHist = await evolucionService.getHistorialPorCliente(id_cliente);
            if (resHist.success) {
                setHistorial(resHist.data);
                
                // Si venimos de un turno, buscamos si ya existe una evolución para ese ID
                if (id_turno_recibido) {
                    const existente = resHist.data.find(h => h.id_turno === id_turno_recibido);
                    if (existente) {
                        setEvolucionActual(existente);
                        // Desglosamos el string guardado para los inputs
                        const desc = existente.descripcion_evolucion || '';
                        setNotas(desc.split('NOTAS: ')[1]?.split('\n\n')[0] || '');
                        setProductos(desc.split('PRODUCTOS: ')[1]?.split('\n\n')[0] || '');
                        setRecomendaciones(desc.split('RECOMENDACIONES: ')[1] || '');
                    }
                }
            }

            const resNombre = await evolucionService.getNombreCliente(id_cliente);
            if (resNombre.success) {
                setNombreCliente(`${resNombre.data.nombre} ${resNombre.data.apellido}`);
            }
        } catch (err) {
            console.error("Error cargando datos", err);
        }
    };

    useEffect(() => { cargarDatos(); }, [id_cliente, id_turno_recibido]);

    const onSubmitForm = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleGuardarReal = async () => {
        setLoading(true);
        
        const data = {
            id_cliente: parseInt(id_cliente),
            id_especialista: user.id_especialista, 
            id_turno: id_turno_recibido,
            descripcion_evolucion: `NOTAS: ${notas}\n\nPRODUCTOS: ${productos}\n\nRECOMENDACIONES: ${recomendaciones}`
        };

        try {
            // Si ya existe, hacemos UPDATE, si no, CREATE
            if (evolucionActual) {
                await evolucionService.update(evolucionActual.id_evolucion, data);
            } else {
                await evolucionService.create(data);
            }
            
            setShowConfirm(false);
            setStatusModal({
                show: true,
                type: 'success',
                message: evolucionActual ? 'Evolución actualizada correctamente.' : '¡Ficha guardada con éxito!'
            });

            // Recargamos datos para ver el cambio sin salir de la página
            await cargarDatos();
            
        } catch (err) {
            setShowConfirm(false);
            setStatusModal({
                show: true,
                type: 'error',
                message: 'Error al guardar: ' + (err.response?.data?.message || err.message)
            });
        } finally {
            setLoading(false);
        }
    };

    const closeAllModals = () => {
        setStatusModal({ show: false, type: '', message: '' });
    };

    return (
        <div className="bg-[#FBF9F8] p-6 min-h-[85vh] max-w-6xl mx-auto">
            {/* MODAL CONFIRMACIÓN */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl swal-animation">
                        <div className="flex items-center gap-3 mb-4 text-[#A87379]">
                            <HelpCircle size={24} />
                            <h3 className="text-xl font-bold">Confirmar</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">¿Estás seguro de guardar esta evolución?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">Cancelar</button>
                            <button onClick={handleGuardarReal} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-[#A87379] text-white font-bold text-sm flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ESTATUS */}
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

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#A87379]">Ficha Clínica: <span className="text-slate-700">{nombreCliente}</span></h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-700">Historial de Sesiones</h3>
                    {historial.length > 0 ? (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {historial.map(h => (
                                <div key={h.id_evolucion} className={`p-4 rounded-xl border ${h.id_turno === id_turno_recibido ? 'border-[#A87379] bg-[#A87379]/5' : 'bg-white border-slate-200'}`}>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
                                        <span>{new Date(h.fecha_registro).toLocaleDateString()}</span>
                                        <span>{h.especialista_nombre}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 whitespace-pre-line">{h.descripcion_evolucion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">No hay historial previo.</div>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-[#A87379] mb-4">
                        {evolucionActual ? 'Editar Evolución Actual' : 'Registrar Nueva Evolución'}
                    </h3>
                    <form onSubmit={onSubmitForm} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones</label>
                            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none" rows="4" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Productos</label>
                            <input value={productos} onChange={(e) => setProductos(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none" type="text" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Recomendaciones</label>
                            <textarea value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none" rows="2" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl">Volver</button>
                            <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#A87379] rounded-xl">
                                {evolucionActual ? 'Actualizar Evolución' : 'Guardar Evolución'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}