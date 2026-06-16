//Disponibilidad (Disponibilidad.jsx): Es la Gestión de Excepciones. 
// Es para el "día a día": "Este jueves tengo que salir a las 15:00 por un trámite" 
// o "Voy a abrir el sábado de mañana solo por esta vez".

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import axios from 'axios'; // Recuerda que prefieres AXIOS
import SelectorHorarios from '../../components/especialistas/SelectorHorarios';
import { useAuth } from '../../context/AuthContext';

export default function Disponibilidad() {
    const { user } = useAuth();
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [diasBloqueados, setDiasBloqueados] = useState({});
    const [configuracion, setConfiguracion] = useState(null);

    const idEspecialista = user?.id_especialista;

 useEffect(() => {
    const cargarAgendaCompleta = async () => {
        if (!idEspecialista) return;

        try {
            const res = await axios.get(`/api/turnos/agenda/resumen/${idEspecialista}`);
            
            // LOG DE DEPURACIÓN CRÍTICO
            console.log("LOG ESTRUCTURA COMPLETA:", JSON.stringify(res.data, null, 2));

            // Si res.data es un string (porque el backend devolvió un html), el JSON.stringify fallará
            // Pero como vimos que devuelve JSON, busquemos dónde está el bloque "data"
            const datos = res.data.data || res.data; 

            if (!datos || typeof datos !== 'object') {
                console.error("DEBUG: La estructura de res.data no es la esperada", res.data);
                return;
            }

            // Procesar bloqueos
            const bloqueos = datos.bloqueos || [];
            const contadorDias = {};
            
            bloqueos.forEach(b => {
                const fecha = b.fecha_inicio.split('T')[0];
                contadorDias[fecha] = (contadorDias[fecha] || 0) + 1;
            });

            setDiasBloqueados(contadorDias);
            setConfiguracion(datos);
            console.log("¡Carga exitosa!");
                
        } catch (err) {
            console.error("Error al cargar en Disponibilidad:", err);
        }
    };
    cargarAgendaCompleta();
}, [idEspecialista]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = format(date, 'yyyy-MM-dd');
            const diaSemana = format(date, 'EEEE').toLowerCase(); // ej: 'sunday'
            const cantidadBloqueos = diasBloqueados[fechaStr] || 0;

            // Lógica de Pintado:
            // 1. Si está bloqueado manualmente
            if (cantidadBloqueos >= 6) return 'dia-bloqueado-rojo';
            if (cantidadBloqueos > 0) return 'dia-con-bloqueos-parciales';

            // 2. Si es un día no laboral según configuración (ej: domingo 00:00-00:00)
            if (configuracion && configuracion[diaSemana]?.inicio === "00:00") {
                return 'dia-bloqueado-base'; // Necesitas crear este estilo en CSS
            }
        }
        return null;
    };

    if (!idEspecialista) return <p className="p-6 text-center">Cargando...</p>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-[#A87379] mb-6">Gestión de Agenda</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <Calendar 
                        onChange={setFechaSeleccionada} 
                        value={fechaSeleccionada} 
                        className="w-full !border-none"
                        tileClassName={tileClassName}
                    />
                </div>

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