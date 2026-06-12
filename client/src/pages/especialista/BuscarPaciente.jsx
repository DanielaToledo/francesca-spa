import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService'; 

export default function BuscarPaciente() {
    const [busqueda, setBusqueda] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false); // Estado de carga
    const [buscado, setBuscado] = useState(false); // Para saber si ya hicimos una búsqueda
    const navigate = useNavigate();

    const handleBuscar = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await clienteService.buscar(busqueda);
            setPacientes(res.data || []);
            setBuscado(true);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
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
            // Si el usuario borra todo, limpiamos la lista automáticamente
            if (e.target.value === '') {
                setPacientes([]);
                setBuscado(false); 
            }
        }}
    />
    <button 
        type="submit" 
        disabled={loading || !busqueda.trim()} // Deshabilita si está vacío o cargando
        className="bg-[#A87379] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#8e6065] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
        {loading ? (
            <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Buscando...
            </span>
        ) : 'Buscar'}
    </button>
</form>

            <div className="space-y-3">
                {/* Mensaje de no resultados */}
                {buscado && pacientes.length === 0 && !loading && (
                    <p className="text-center text-slate-400 py-4">No se encontraron pacientes con ese nombre.</p>
                )}

                {/* Listado de resultados */}
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