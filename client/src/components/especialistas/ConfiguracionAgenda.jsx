import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function ConfiguracionAgenda({ initialConfig, onSave, loading }) {
    const [config, setConfig] = useState(initialConfig);

    const handleChange = (dia, campo, valor) => {
        setConfig(prev => ({
            ...prev,
            [dia]: { ...prev[dia], [campo]: valor }
        }));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-700">Configuración de Horarios</h3>
            
            {['lun_vie', 'sabado', 'domingo'].map((dia) => (
                <div key={dia} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b border-slate-50 pb-4">
                    <label className="font-bold text-slate-600 capitalize">{dia.replace('_', ' a ')}</label>
                    <div className="flex gap-2">
                        <input type="time" value={config[dia].inicio} onChange={(e) => handleChange(dia, 'inicio', e.target.value)} className="p-2 border rounded-lg" />
                        <span className="self-center">a</span>
                        <input type="time" value={config[dia].fin} onChange={(e) => handleChange(dia, 'fin', e.target.value)} className="p-2 border rounded-lg" />
                    </div>
                </div>
            ))}

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