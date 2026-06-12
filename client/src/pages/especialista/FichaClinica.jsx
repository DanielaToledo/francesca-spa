import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // 1. Agregamos useLocation
import { useAuth } from '../../context/AuthContext';
import { evolucionService } from '../../services/evolucionService';

export default function FichaClinica() {
    const { id_cliente } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 2. Obtenemos el estado de la navegación
    const { user } = useAuth();
    
    // Capturamos el id_turno si existe, sino será null
    const id_turno_recibido = location.state?.id_turno || null; 

    const [notas, setNotas] = useState('');
    const [productos, setProductos] = useState('');
    const [recomendaciones, setRecomendaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [nombreCliente, setNombreCliente] = useState('Cargando...');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resHist = await evolucionService.getHistorialPorCliente(id_cliente);
                if (resHist.success) setHistorial(resHist.data);

                const resNombre = await evolucionService.getNombreCliente(id_cliente);
                if (resNombre.success) {
                    setNombreCliente(`${resNombre.data.nombre} ${resNombre.data.apellido}`);
                }
            } catch (err) {
                console.error("Error cargando datos", err);
            }
        };
        cargarDatos();
    }, [id_cliente]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const nuevaFicha = {
            id_cliente: parseInt(id_cliente),
            id_especialista: user.id_especialista, 
            id_turno: id_turno_recibido, // 3. Usamos el turno capturado
            descripcion_evolucion: `NOTAS: ${notas}\n\nPRODUCTOS: ${productos}\n\nRECOMENDACIONES: ${recomendaciones}`
        };

        try {
            await evolucionService.create(nuevaFicha);
            alert('¡Ficha guardada y turno actualizado! ✨');
            
            // Limpiar y recargar
            setNotas('');
            setProductos('');
            setRecomendaciones('');
            const resHist = await evolucionService.getHistorialPorCliente(id_cliente);
            if (resHist.success) setHistorial(resHist.data);
            
            // Opcional: Volver a la agenda si veníamos de un turno
            if (id_turno_recibido) navigate('/especialista/agenda');
            
        } catch (err) {
            alert('Error al guardar: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FBF9F8] p-6 min-h-[85vh] max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#A87379]">
                    Ficha Clínica: <span className="text-slate-700">{nombreCliente}</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium">ID Cliente: {id_cliente}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* HISTORIAL */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-700">Historial de Sesiones</h3>
                    {historial.length > 0 ? (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {historial.map(h => (
                                <div key={h.id_evolucion} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
                                        <span>{new Date(h.fecha_registro).toLocaleDateString()}</span>
                                        <span>{h.especialista_nombre}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 whitespace-pre-line">{h.descripcion_evolucion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
                            No hay historial previo para esta clienta.
                        </div>
                    )}
                </div>

                {/* FORMULARIO */}
                <div>
                    <h3 className="font-bold text-[#A87379] mb-4">Registrar Nueva Evolución</h3>
                    <form onSubmit={handleGuardar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones</label>
                            <textarea 
                                value={notas} onChange={(e) => setNotas(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EAA0AB] outline-none" rows="4" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Productos</label>
                            <input 
                                value={productos} onChange={(e) => setProductos(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EAA0AB] outline-none" type="text"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Recomendaciones</label>
                            <textarea 
                                value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EAA0AB] outline-none" rows="2"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)} // Vuelve atrás a donde sea que estaba
                                className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Volver
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="flex-1 py-3 font-bold text-white bg-[#A87379] rounded-xl hover:bg-[#8e6065] transition-all"
                            >
                                {loading ? 'Guardando...' : 'Guardar Evolución'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}