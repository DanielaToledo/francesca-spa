import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Calendar } from 'lucide-react';

export default function ConfiguracionAgenda({ initialConfig, onSave, loading }) {
    // Definimos los días en un orden fijo y estricto para que nunca se mezclen
    const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    const horariosPorDefecto = {
        lunes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
        martes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
        miercoles: { inicio: "09:00", fin: "18:00", intervalo: 60 },
        jueves: { inicio: "09:00", fin: "18:00", intervalo: 60 },
        viernes: { inicio: "09:00", fin: "18:00", intervalo: 60 },
        sabado: { inicio: "09:00", fin: "13:00", intervalo: 60 },
        domingo: { inicio: "09:00", fin: "13:00", intervalo: 60 }
    };

    const [config, setConfig] = useState({
        horarios: horariosPorDefecto,
        bloqueos: [],
        duracion_turno: 60
    });

    // Sincronización con la base de datos
    useEffect(() => {
        if (initialConfig) {
            setConfig({
                horarios: { ...horariosPorDefecto, ...(initialConfig.horarios || {}) },
                bloqueos: Array.isArray(initialConfig.bloqueos) ? initialConfig.bloqueos : [],
                duracion_turno: initialConfig.duracion_turno || 60
            });
        }
    }, [initialConfig]);

    const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: '', motivo: '' });

    const handleChangeHorario = (dia, campo, valor) => {
        setConfig(prev => ({
            ...prev,
            horarios: {
                ...prev.horarios,
                [dia]: { 
                    ...(prev.horarios[dia] || { inicio: "09:00", fin: "18:00", intervalo: 60 }), 
                    [campo]: valor 
                }
            }
        }));
    };

    const agregarBloqueo = () => {
        if (!nuevoBloqueo.fecha) return;
        const fechaPura = nuevoBloqueo.fecha.split('T')[0];
        
        if (config.bloqueos.find(b => b.fecha && b.fecha.split('T')[0] === fechaPura)) return;
        
        setConfig(prev => ({
            ...prev,
            bloqueos: [...prev.bloqueos, { fecha: fechaPura, motivo: nuevoBloqueo.motivo }]
        }));
        setNuevoBloqueo({ fecha: '', motivo: '' });
    };

    const eliminarBloqueo = (index) => {
        setConfig(prev => ({ ...prev, bloqueos: prev.bloqueos.filter((_, i) => i !== index) }));
    };

    const formatearFechaVisual = (fechaStr) => {
        if (!fechaStr) return '';
        const limpia = fechaStr.split('T')[0];
        if (limpia.includes('-')) {
            const partes = limpia.split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }
        return limpia;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
            {/* Sección Horarios */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4">Horarios e Intervalos</h3>
                {diasOrdenados.map((dia) => {
                    const horarioDia = config.horarios[dia] || { inicio: "09:00", fin: "18:00", intervalo: 60 };
                    return (
                        <div key={dia} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-slate-50 py-3">
                            <label className="font-bold text-slate-600 capitalize">{dia}</label>
                            <div className="flex gap-1 md:col-span-2 items-center">
                                <input 
                                    type="time" 
                                    value={horarioDia.inicio} 
                                    onChange={(e) => handleChangeHorario(dia, 'inicio', e.target.value)} 
                                    className="p-2 border rounded-lg w-full" 
                                />
                                <span>a</span>
                                <input 
                                    type="time" 
                                    value={horarioDia.fin} 
                                    onChange={(e) => handleChangeHorario(dia, 'fin', e.target.value)} 
                                    className="p-2 border rounded-lg w-full" 
                                />
                            </div>
                            <select 
                                value={horarioDia.intervalo} 
                                onChange={(e) => handleChangeHorario(dia, 'intervalo', parseInt(e.target.value))} 
                                className="p-2 border rounded-lg w-full text-sm"
                            >
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>60 min</option>
                            </select>
                        </div>
                    );
                })}
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
                            <span className="font-medium">
                                {formatearFechaVisual(b.fecha)} {b.motivo ? `- ${b.motivo}` : ''}
                            </span>
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