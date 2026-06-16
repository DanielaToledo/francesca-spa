import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Calendar } from 'lucide-react';

export default function ConfiguracionAgenda({ initialConfig, onSave, loading }) {
    // Inicializamos el estado asegurando que exista la propiedad 'bloqueos'
    const [config, setConfig] = useState({
        ...initialConfig,
        bloqueos: initialConfig.bloqueos || []
    });
    
    const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: '', motivo: '' });

    const handleChange = (dia, campo, valor) => {
        setConfig(prev => ({
            ...prev,
            [dia]: { ...prev[dia], [campo]: valor }
        }));
    };

    const agregarBloqueo = () => {
        if (!nuevoBloqueo.fecha) return;
        setConfig(prev => ({
            ...prev,
            bloqueos: [...prev.bloqueos, nuevoBloqueo]
        }));
        setNuevoBloqueo({ fecha: '', motivo: '' });
    };

    const eliminarBloqueo = (index) => {
        setConfig(prev => ({
            ...prev,
            bloqueos: prev.bloqueos.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
            
            {/* Sección Horarios */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4">Horarios de Atención</h3>
                {['lun_vie', 'sabado', 'domingo'].map((dia) => (
                    <div key={dia} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b border-slate-50 py-3">
                        <label className="font-bold text-slate-600 capitalize">{dia.replace('_', ' a ')}</label>
                        <div className="flex gap-2">
                            <input type="time" value={config[dia].inicio} onChange={(e) => handleChange(dia, 'inicio', e.target.value)} className="p-2 border rounded-lg w-full" />
                            <span className="self-center">a</span>
                            <input type="time" value={config[dia].fin} onChange={(e) => handleChange(dia, 'fin', e.target.value)} className="p-2 border rounded-lg w-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Sección Fechas Bloqueadas */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Calendar size={18} /> Fechas Inhabilitadas
                </h3>
                
                <div className="flex gap-2 mb-4">
                    <input type="date" value={nuevoBloqueo.fecha} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha: e.target.value})} className="p-2 border rounded-lg flex-1 text-sm" />
                    <input type="text" placeholder="Motivo (ej. Cumpleaños)" value={nuevoBloqueo.motivo} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, motivo: e.target.value})} className="p-2 border rounded-lg flex-1 text-sm" />
                    <button onClick={agregarBloqueo} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200"><Plus size={20} /></button>
                </div>

                <div className="space-y-2">
                    {config.bloqueos.map((b, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            <span className="font-medium">{new Date(b.fecha).toLocaleDateString()} - {b.motivo}</span>
                            <button onClick={() => eliminarBloqueo(i)} className="hover:text-red-900"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => onSave(config)} 
                disabled={loading}
                className="w-full py-3 bg-[#A87379] text-white rounded-xl font-bold flex justify-center gap-2 hover:bg-[#925f65] transition"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Cambios</>}
            </button>
        </div>
    );
}