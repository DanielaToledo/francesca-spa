import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Calendar } from 'lucide-react';

export default function ConfiguracionAgenda({ initialConfig, onSave, loading }) {
    // Estado inicial: asegura que si initialConfig es null, use los defaults
    const [config, setConfig] = useState(() => ({
        horarios: initialConfig?.horarios || {
            lunes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
            martes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
            miercoles: { inicio: "09:00", fin: "18:00", intervalo: 60 },
            jueves: { inicio: "09:00", fin: "18:00", intervalo: 60 },
            viernes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
            sabado: { inicio: "09:00", fin: "13:00", intervalo: 60 },
            domingo: { inicio: "09:00", fin: "13:00", intervalo: 60 }
        },
        bloqueos: initialConfig?.bloqueos || [],
        duracion_turno: initialConfig?.duracion_turno || 60
    }));

    const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: '', motivo: '' });

    const handleChangeHorario = (dia, campo, valor) => {
        setConfig(prev => ({
            ...prev,
            horarios: {
                ...prev.horarios,
                [dia]: { ...prev.horarios[dia], [campo]: valor }
            }
        }));
    };

    const agregarBloqueo = () => {
        if (!nuevoBloqueo.fecha) return;
        // Evitamos duplicados básicos
        if (config.bloqueos.find(b => b.fecha === nuevoBloqueo.fecha)) return;
        
        setConfig(prev => ({
            ...prev,
            bloqueos: [...prev.bloqueos, nuevoBloqueo]
        }));
        setNuevoBloqueo({ fecha: '', motivo: '' });
    };

    const eliminarBloqueo = (index) => {
        setConfig(prev => ({ ...prev, bloqueos: prev.bloqueos.filter((_, i) => i !== index) }));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
            {/* Sección Horarios */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4">Horarios e Intervalos</h3>
                {Object.keys(config.horarios).map((dia) => (
                    <div key={dia} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-slate-50 py-3">
                        <label className="font-bold text-slate-600 capitalize">{dia}</label>
                        <div className="flex gap-1 md:col-span-2 items-center">
                            <input type="time" value={config.horarios[dia].inicio} onChange={(e) => handleChangeHorario(dia, 'inicio', e.target.value)} className="p-2 border rounded-lg w-full" />
                            <span>a</span>
                            <input type="time" value={config.horarios[dia].fin} onChange={(e) => handleChangeHorario(dia, 'fin', e.target.value)} className="p-2 border rounded-lg w-full" />
                        </div>
                        <select value={config.horarios[dia].intervalo} onChange={(e) => handleChangeHorario(dia, 'intervalo', parseInt(e.target.value))} className="p-2 border rounded-lg w-full text-sm">
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                        </select>
                    </div>
                ))}
            </div>

            {/* Sección Bloqueos */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Calendar size={18} /> Fechas Inhabilitadas
                </h3>
                <div className="flex gap-2 mb-4">
                    <input type="date" value={nuevoBloqueo.fecha} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha: e.target.value})} className="p-2 border rounded-lg flex-1 text-sm" />
                    <input type="text" placeholder="Motivo" value={nuevoBloqueo.motivo} onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, motivo: e.target.value})} className="p-2 border rounded-lg flex-1 text-sm" />
                    <button onClick={agregarBloqueo} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200"><Plus size={20} /></button>
                </div>

                <div className="space-y-2">
                    {config.bloqueos.map((b, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            {/* CORRECCIÓN: Usar split para evitar el problema de zona horaria de 'new Date()' */}
                            <span className="font-medium">{b.fecha.split('-').reverse().join('/')} - {b.motivo}</span>
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