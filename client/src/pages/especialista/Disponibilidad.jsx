import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import axios from 'axios';
import SelectorHorarios from '../../components/especialistas/SelectorHorarios';
import { useAuth } from '../../context/AuthContext';

export default function Disponibilidad() {
    const { user } = useAuth();
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [diasConBloqueo, setDiasConBloqueo] = useState([]);

    const idEspecialista = user?.id_especialista;

    // Cargar bloqueos al iniciar
useEffect(() => {
        const cargarBloqueos = async () => {
            if (idEspecialista) {
                try {
                    const response = await axios.get(`/api/bloqueos/${idEspecialista}`);
                    
                    // Ajuste: verificamos si response.data es un array o si debemos buscar dentro de un objeto
                    const dataArray = Array.isArray(response.data) 
                        ? response.data 
                        : (response.data.data || []); // Aquí buscamos dentro de response.data.data si el array no está directo

                    const fechas = dataArray.map(b => format(new Date(b.fecha_inicio), 'yyyy-MM-dd'));
                    setDiasConBloqueo(fechas);
                } catch (err) {
                    console.error("Error cargando bloqueos:", err);
                }
            }
        };
        cargarBloqueos();
    }, [idEspecialista]);

    // Función para registrar un nuevo bloqueo usando AXIOS
    const registrarBloqueo = async (datosBloqueo) => {
        try {
            const response = await axios.post('/api/bloqueos', datosBloqueo);
            if (response.data.success) {
                alert('Bloqueo registrado con éxito');
                window.location.reload(); 
            }
        } catch (err) {
            console.error("Error al registrar bloqueo:", err);
            alert('Hubo un error al guardar el bloqueo.');
        }
    };

    if (!idEspecialista) return <p className="p-6 text-center">Cargando...</p>;

return (
        <div className="p-6 max-w-7xl mx-auto"> {/* Maximo ancho aumentado */}
            <h2 className="text-2xl font-bold text-[#A87379] mb-6">Gestión de Agenda</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
                
                {/* Panel Izquierdo: Calendario Grande */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full">
    <Calendar 
        onChange={setFechaSeleccionada} 
        value={fechaSeleccionada} 
        className="w-full !border-none text-lg" // El !important asegura que sobrescriba
        // Estas clases estiran los botones de los días
        tileClassName="min-h-[80px] flex flex-col items-center justify-start p-2" 
    />
</div>

                {/* Panel Derecho: Selector y Lista (Lo que ya hicimos) */}
                <div className="space-y-6">
                    <SelectorHorarios 
                        fecha={fechaSeleccionada} 
                        id_especialista={idEspecialista}
                    />
                </div>
            </div>
        </div>
    );
}