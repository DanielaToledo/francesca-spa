//este archivo lo que hace es mostrar el calendario y el selector de horarios, es la vista principal de la agenda, desde aqui se cargan los datos y se pasan al selector
// tambien se encarga de mostrar los días bloqueados en el calendario, y de cargar la configuración de horarios para cada día, que luego se pasa al selector para generar las horas dinámicamente
// aca se crean los horarios base para cada día, en caso de que el backend no traiga la configuración, asi evitamos errores y mostramos algo por defecto

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import SelectorHorarios from '../../components/especialistas/SelectorHorarios';
import { useAuth } from '../../context/AuthContext';
import { hookUseDisponibilidad } from '../../hooks/hookUseDisponibilidad';

const ResumenBloqueos = ({ bloqueos, onDesbloquear }) => {
    const hoy = format(new Date(), 'yyyy-MM-dd');
    const proximos = (bloqueos || []).filter(b => b.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 5);

    if (proximos.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
            <h4 className="font-bold text-[#A87379] mb-4">Próximos días bloqueados</h4>
            <div className="space-y-3">
                {proximos.map((b, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-700">{b.fecha.split('-').reverse().join('/')}</p>
                            <p className="text-xs text-slate-500">{b.motivo || 'Bloqueo manual'}</p>
                        </div>
                        <button onClick={() => onDesbloquear(b.fecha)} className="text-xs text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded transition">Desbloquear</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Disponibilidad() {
    const { user } = useAuth();
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    
    // Usamos nuestro hook
    const { configuracion, diasBloqueados, cargarAgendaCompleta, desbloquearFecha } = hookUseDisponibilidad(user?.id_especialista);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            // Fecha actual del calendario del mes en formato YYYY-MM-DD
            const fechaCalendarioISO = format(date, 'yyyy-MM-dd');
            // Y también en formato DD/MM/YYYY por si acaso
            const fechaCalendarioDMY = format(date, 'dd/MM/yyyy');
            
            const cantidadBloqueos = diasBloqueados[fechaCalendarioISO] || 0;
            
            // 🌟 Verificación blindada contra cualquier formato de fecha guardada
            const esBloqueoConfig = configuracion?.bloqueos?.some(b => {
                if (!b.fecha) return false;
                let fechaBloqueo = b.fecha.toString().trim();

                // Si viene con hora (ISO), nos quedamos solo con la parte de la fecha
                if (fechaBloqueo.includes('T')) {
                    fechaBloqueo = fechaBloqueo.split('T')[0];
                }

                let fechaBloqueoISO = '';
                let fechaBloqueoDMY = '';

                // Si está en formato YYYY-MM-DD (ej: 2026-11-29)
                if (fechaBloqueo.includes('-') && fechaBloqueo.split('-')[0].length === 4) {
                    fechaBloqueoISO = fechaBloqueo;
                    const partes = fechaBloqueo.split('-');
                    fechaBloqueoDMY = `${partes[2]}/${partes[1]}/${partes[0]}`;
                } 
                // Si está en formato DD/MM/YYYY (ej: 29/11/2026)
                else if (fechaBloqueo.includes('/')) {
                    fechaBloqueoDMY = fechaBloqueo;
                    const partes = fechaBloqueo.split('/');
                    if (partes.length === 3) {
                        fechaBloqueoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
                    }
                }

                // Comparamos ambas posibilidades
                return fechaBloqueoISO === fechaCalendarioISO || fechaBloqueoDMY === fechaCalendarioDMY;
            });

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

    if (!user?.id_especialista) return <p className="p-6 text-center">Cargando...</p>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-[#A87379] mb-6">Gestión de Agenda</h2>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <Calendar onChange={setFechaSeleccionada} value={fechaSeleccionada} className="w-full !border-none" tileClassName={tileClassName} />
                    <ResumenBloqueos bloqueos={configuracion?.bloqueos || []} onDesbloquear={desbloquearFecha} />
                </div>
                <div className="space-y-6">
                    <SelectorHorarios
                        key={`sel-${format(fechaSeleccionada, 'yyyy-MM-dd')}-${JSON.stringify(configuracion)}`}
                        fecha={fechaSeleccionada}
                        id_especialista={user.id_especialista}
                        configuracion={configuracion}
                        onActualizar={cargarAgendaCompleta}
                    />
                </div>
            </div>
        </div>
    );
}