import { useNavigate } from 'react-router-dom';
import { hookUseBuscarPaciente } from '../../hooks/hookUseBuscarPaciente';

export default function BuscarPaciente() {
    const navigate = useNavigate();
    const { 
        busqueda, setBusqueda, pacientes, loading, buscado, 
        ejecutarBusqueda, limpiarBusqueda 
    } = hookUseBuscarPaciente();

    const handleBuscar = (e) => {
        e.preventDefault();
        ejecutarBusqueda(busqueda);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-extrabold text-[#A87379] mb-6">🔍 Buscar Paciente</h2>
            
            <form onSubmit={handleBuscar} className="flex gap-4 mb-8">
                <input 
                    className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#EAA0AB] transition-all"
                    placeholder="Escribe el nombre o apellido del paciente..."
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        if (e.target.value === '') limpiarBusqueda();
                    }}
                />
                <button 
                    type="submit" 
                    disabled={loading || !busqueda.trim()}
                    className="bg-[#A87379] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#8e6065] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            <div className="space-y-3">
                {buscado && pacientes.length === 0 && !loading && (
                    <p className="text-center text-slate-400 py-4">No se encontraron pacientes con ese nombre.</p>
                )}

                {pacientes.map(p => (
                    <div key={p.id_cliente} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-[#FBF9F8] transition-colors">
                        <span className="font-bold text-slate-700">{p.nombre} {p.apellido}</span>
                        <button 
                            onClick={() => navigate(`/especialista/ficha/${p.id_cliente}`)}
                            className="text-[#A87379] font-bold text-sm bg-[#F4CFCC]/30 px-4 py-2 rounded-lg hover:bg-[#F4CFCC]/60 transition-all"
                        >
                            Ver Ficha →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}