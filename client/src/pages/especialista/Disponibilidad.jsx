//este archivo lo que hace es mostrar el calendario y el selector de horarios, es la vista principal de la agenda, desde aqui se cargan los datos y se pasan al selector
// tambien se encarga de mostrar los días bloqueados en el calendario, y de cargar la configuración de horarios para cada día, que luego se pasa al selector para generar las horas dinámicamente
// aca se crean los horarios base para cada día, en caso de que el backend no traiga la configuración, asi evitamos errores y mostramos algo por defecto


//Sincronización Total: Disponibilidad ahora le pasa la configuración "limpia" a SelectorHorarios.
//Visualización: El calendario volverá a pintarse correctamente porque ahora configuracion siempre tiene la estructura horarios.{dia}.
//Funcionamiento del Selector: Al recibir la configuracion como prop, SelectorHorarios dejará de estar "ciego" y podrá generar los bloques de tiempo (ej. 30min o 60min) que el especialista configuró.


import { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import axios from 'axios';
import SelectorHorarios from '../../components/especialistas/SelectorHorarios';
import { useAuth } from '../../context/AuthContext';
import { especialistaService } from '../../services/especialistaService';

// Componente de Resumen lateral
const ResumenBloqueos = ({ bloqueos, onDesbloquear }) => {
    // Usamos string para comparar sin zonas horarias
    const hoy = format(new Date(), 'yyyy-MM-dd');
    
    const proximos = (bloqueos || [])
        .filter(b => b.fecha >= hoy)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(0, 5);

    if (proximos.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
            <h4 className="font-bold text-[#A87379] mb-4">Próximos días bloqueados</h4>
            <div className="space-y-3">
                {proximos.map((b, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            {/* CORRECCIÓN: Formato directo de string */}
                            <p className="text-sm font-bold text-slate-700">
                                {b.fecha.split('-').reverse().join('/')}
                            </p>
                            <p className="text-xs text-slate-500">{b.motivo || 'Bloqueo manual'}</p>
                        </div>
                        <button 
                            onClick={() => onDesbloquear(b.fecha)}
                            className="text-xs text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded transition"
                        >
                            Desbloquear
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Disponibilidad() {
    const { user } = useAuth();
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [diasBloqueados, setDiasBloqueados] = useState({});
    const [configuracion, setConfiguracion] = useState(null);
    const [listaBloqueosGlobal, setListaBloqueosGlobal] = useState([]);

    const idEspecialista = user?.id_especialista;

    const procesarBloqueos = useCallback((listaBloqueos) => {
        const mapa = {};
        if (Array.isArray(listaBloqueos)) {
            listaBloqueos.forEach(b => {
                // Usamos substring para no depender de objetos Date
                const fecha = b.fecha_inicio.substring(0, 10);
                mapa[fecha] = (mapa[fecha] || 0) + 1;
            });
        }
        setDiasBloqueados(mapa);
    }, []);

    const cargarAgendaCompleta = useCallback(async () => {
        if (!idEspecialista) return;
        try {
            const res = await axios.get(`/api/turnos/agenda/resumen/${idEspecialista}`);
            const data = res.data.data;
            
            setListaBloqueosGlobal(data.bloqueos || []);
            procesarBloqueos(data.bloqueos || []);
            setConfiguracion(data.configuracion_agenda);
        } catch (err) {
            console.error("Error al cargar la agenda:", err);
        }
    }, [idEspecialista, procesarBloqueos]);

    useEffect(() => {
        cargarAgendaCompleta();
    }, [cargarAgendaCompleta]);

    const handleDesbloquearDesdeResumen = async (fecha) => {
        try {
            const bloqueoManual = listaBloqueosGlobal.find(b => b.fecha_inicio.startsWith(fecha));

            if (bloqueoManual && bloqueoManual.id_bloqueo) {
                await axios.delete(`/api/bloqueos/${bloqueoManual.id_bloqueo}`);
            } else {
                const nuevaConfig = { ...configuracion };
                if (nuevaConfig.bloqueos) {
                    nuevaConfig.bloqueos = nuevaConfig.bloqueos.filter(b => b.fecha !== fecha);
                }
                await especialistaService.updateConfig(idEspecialista, nuevaConfig);
            }
            await cargarAgendaCompleta();
        } catch (error) {
            alert("Hubo un error al intentar eliminar el bloqueo.");
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = format(date, 'yyyy-MM-dd');
            const cantidadBloqueos = diasBloqueados[fechaStr] || 0;
            const esBloqueoConfig = configuracion?.bloqueos?.some(b => b.fecha === fechaStr);

            if (cantidadBloqueos >= 6 || esBloqueoConfig) return 'dia-bloqueado-rojo';
            if (cantidadBloqueos > 0) return 'dia-con-bloqueos-parciales';

            if (configuracion?.horarios) {
                const mapaDias = { monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves', friday: 'viernes', saturday: 'sabado', sunday: 'domingo' };
                const diaSemanaEsp = mapaDias[format(date, 'EEEE').toLowerCase()];
                const horario = configuracion.horarios[diaSemanaEsp];

                if (!horario || horario.inicio === horario.fin) return 'dia-bloqueado-base';
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
                    <ResumenBloqueos 
                        bloqueos={configuracion?.bloqueos || []} 
                        onDesbloquear={handleDesbloquearDesdeResumen} 
                    />
                </div>

                <div className="space-y-6">
                    <SelectorHorarios
                        key={`sel-${format(fechaSeleccionada, 'yyyy-MM-dd')}-${JSON.stringify(configuracion)}`}
                        fecha={fechaSeleccionada}
                        id_especialista={idEspecialista}
                        configuracion={configuracion}
                        onActualizar={cargarAgendaCompleta}
                    />
                </div>
            </div>
        </div>
    );
}