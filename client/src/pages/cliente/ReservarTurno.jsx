import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { hookUseReservas } from '../../hooks/hookUseReservas';
import { especialistaService } from '../../services/especialistaService';
import { hookUseDisponibilidad } from '../../hooks/hookUseDisponibilidad';

export default function ReservarTurno() {
  const { 
    servicios, 
    loading, 
    error, 
    servicioSeleccionado, 
    setServicioSeleccionado 
  } = hookUseReservas();

  // Control de pasos: 1 = Servicio, 2 = Especialista, 3 = Fecha y Hora
  const [pasoActual, setPasoActual] = useState(1);
  const [especialistas, setEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [loadingEspecialistas, setLoadingEspecialistas] = useState(false);

  // Estados del Paso 3 (Fecha, Hora y Modal de Éxito)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [enviandoReserva, setEnviandoReserva] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);

  // Cargar disponibilidad del especialista seleccionado
  const { configuracion, loading: loadingDisponibilidad } = hookUseDisponibilidad(especialistaSeleccionado?.id_especialista);

  // Estado para expandir descripciones largas de servicios
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (e, id) => {
    e.stopPropagation();
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Transición del Paso 1 al Paso 2
  const handleContinuarAEspecialista = async () => {
    if (!servicioSeleccionado) return;
    try {
      setLoadingEspecialistas(true);
      setPasoActual(2);
      const data = await especialistaService.getByServicio(servicioSeleccionado.id_servicio);
      setEspecialistas(data || []);
    } catch (err) {
      console.error("Error al cargar especialistas:", err);
    } finally {
      setLoadingEspecialistas(false);
    }
  };

  // Generador de franjas horarias dinámicas según la configuración del especialista
  const obtenerHorariosDisponibles = () => {
    if (!configuracion?.horarios) return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    const mapaDias = { 
      monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', 
      thursday: 'jueves', friday: 'viernes', saturday: 'sabado', sunday: 'domingo' 
    };
    
    const diaSemana = mapaDias[format(fechaSeleccionada, 'EEEE').toLowerCase()];
    const configDia = configuracion.horarios[diaSemana];

    if (!configDia || configDia.inicio === configDia.fin) {
      return []; // Día sin atención
    }

    const horarios = [];
    let [horaIni, minIni] = configDia.inicio.split(':').map(Number);
    const [horaFin, minFin] = configDia.fin.split(':').map(Number);

    const duracion = servicioSeleccionado?.duracion_minutos || servicioSeleccionado?.duracion || 30;

    while (horaIni < horaFin || (horaIni === horaFin && minIni + duracion <= minFin)) {
      const hStr = String(horaIni).padStart(2, '0');
      const mStr = String(minIni).padStart(2, '0');
      horarios.push(`${hStr}:${mStr}`);

      minIni += duracion;
      if (minIni >= 60) {
        horaIni += Math.floor(minIni / 60);
        minIni = minIni % 60;
      }
    }

    return horarios;
  };

  const handleConfirmarReserva = async () => {
    if (!servicioSeleccionado || !especialistaSeleccionado || !fechaSeleccionada || !horaSeleccionada) return;

    try {
      setEnviandoReserva(true);
      // Aquí se conecta la llamada a la API de guardado en la base de datos
      
      // Simulamos éxito y abrimos el modal personalizado
      setModalExitoAbierto(true);
    } catch (err) {
      console.error("Error al registrar la reserva:", err);
    } finally {
      setEnviandoReserva(false);
    }
  };

  // Cerrar modal y reiniciar el flujo de reserva
  const handleCerrarModal = () => {
    setModalExitoAbierto(false);
    setPasoActual(1);
    setServicioSeleccionado(null);
    setEspecialistaSeleccionado(null);
    setHoraSeleccionada(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Cargando catálogo de servicios... 💆‍♀️</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  const horariosDisponibles = obtenerHorariosDisponibles();

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reservar un Turno 📅</h1>

      {/* Indicador de Pasos */}
      <div className="flex items-center space-x-4 mb-8 text-sm font-medium">
        <span className={`px-3 py-1 rounded-full ${pasoActual === 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          1. Servicio
        </span>
        <span>→</span>
        <span className={`px-3 py-1 rounded-full ${pasoActual === 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          2. Especialista
        </span>
        <span>→</span>
        <span className={`px-3 py-1 rounded-full ${pasoActual === 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          3. Fecha y Hora
        </span>
      </div>

      {/* ================= PASO 1: SELECCIONAR SERVICIO ================= */}
      {pasoActual === 1 && (
        <div>
          <p className="text-gray-600 mb-6">Paso 1: Selecciona el tratamiento o servicio que deseas realizarte.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio) => {
              const id = servicio.id_servicio;
              const estaExpandido = expandidos[id];

              return (
                <div 
                  key={id}
                  onClick={() => setServicioSeleccionado(servicio)}
                  className={`border rounded-xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                    servicioSeleccionado?.id_servicio === id 
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {servicio.nombre || servicio.nombre_servicio}
                    </h3>
                    
                    <div className="mt-1 mb-4">
                      <p className={`text-sm text-gray-500 ${!estaExpandido ? 'line-clamp-2' : ''}`}>
                        {servicio.descripcion}
                      </p>
                      
                      {servicio.descripcion && servicio.descripcion.length > 60 && (
                        <button 
                          onClick={(e) => toggleExpandir(e, id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 mt-1 focus:outline-none"
                        >
                          {estaExpandido ? 'Ver menos ▲' : 'Ver más ▼'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm mt-auto">
                    <span className="text-gray-600 font-medium">
                      ⏱️ {servicio.duracion ?? servicio.duracion_minutos} min
                    </span>
                    <span className="text-red-600 font-bold text-base">
                      ${servicio.precio ?? servicio.precio_base}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {servicioSeleccionado && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleContinuarAEspecialista}
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition shadow"
              >
                Continuar con el Especialista →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= PASO 2: SELECCIONAR ESPECIALISTA ================= */}
      {pasoActual === 2 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Elige un Especialista</h2>
              <p className="text-gray-600 text-sm">
                Servicio elegido: <span className="font-semibold text-red-600">{servicioSeleccionado?.nombre || servicioSeleccionado?.nombre_servicio}</span>
              </p>
            </div>
            <button 
              onClick={() => setPasoActual(1)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Cambiar servicio
            </button>
          </div>

          {loadingEspecialistas ? (
            <div className="text-center py-12 text-gray-500">Cargando especialistas disponibles para este servicio...</div>
          ) : especialistas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p>No hay especialistas asignados a este servicio actualmente.</p>
              <button 
                onClick={() => setPasoActual(1)}
                className="mt-4 text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Volver y elegir otro servicio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {especialistas.map((esp) => (
                <div 
                  key={esp.id_especialista}
                  onClick={() => setEspecialistaSeleccionado(esp)}
                  className={`border rounded-xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    especialistaSeleccionado?.id_especialista === esp.id_especialista
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <h3 className="font-semibold text-lg text-gray-800">
                    {esp.nombre} {esp.apellido}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Especialidad: {esp.especialidad || 'General'}</p>
                </div>
              ))}
            </div>
          )}

          {especialistaSeleccionado && (
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setPasoActual(1)}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                ← Atrás
              </button>
              <button 
                onClick={() => setPasoActual(3)}
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition shadow"
              >
                Continuar con Fecha y Hora →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= PASO 3: SELECCIONAR FECHA, HORA Y CONFIRMAR ================= */}
      {pasoActual === 3 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Selecciona Fecha y Hora</h2>
              <p className="text-gray-600 text-sm">
                Especialista: <span className="font-semibold text-gray-800">{especialistaSeleccionado?.nombre} {especialistaSeleccionado?.apellido}</span>
              </p>
            </div>
            <button 
              onClick={() => setPasoActual(2)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Cambiar especialista
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Calendario con bloqueos sincronizados */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-medium text-gray-700 mb-4">1. Selecciona un día</h3>
              <Calendar 
                onChange={(fecha) => {
                  const fechaStr = format(fecha, 'yyyy-MM-dd');
                  
                  // Validamos si el día está bloqueado por el especialista
                  const esBloqueo = configuracion?.bloqueos?.some(b => {
                    if (!b.fecha) return false;
                    const bFechaPura = b.fecha.toString().split('T')[0];
                    return bFechaPura === fechaStr;
                  });

                  if (esBloqueo) {
                    alert("Este día se encuentra inhabilitado por el especialista.");
                    return; // No permitimos seleccionarlo
                  }

                  setFechaSeleccionada(fecha);
                  setHoraSeleccionada(null);
                }} 
                value={fechaSeleccionada}
                minDate={new Date()}
                className="w-full !border-none"
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const fechaCalendarioISO = format(date, 'yyyy-MM-dd');
                    const fechaCalendarioDMY = format(date, 'dd/MM/yyyy');
                    
                    // Verificamos si es un día bloqueado por el especialista
                    const esBloqueoConfig = configuracion?.bloqueos?.some(b => {
                      if (!b.fecha) return false;
                      let fechaBloqueo = b.fecha.toString().trim();

                      if (fechaBloqueo.includes('T')) {
                        fechaBloqueo = fechaBloqueo.split('T')[0];
                      }

                      let fechaBloqueoISO = '';
                      let fechaBloqueoDMY = '';

                      if (fechaBloqueo.includes('-') && fechaBloqueo.split('-')[0].length === 4) {
                        fechaBloqueoISO = fechaBloqueo;
                        const partes = fechaBloqueo.split('-');
                        fechaBloqueoDMY = `${partes[2]}/${partes[1]}/${partes[0]}`;
                      } else if (fechaBloqueo.includes('/')) {
                        fechaBloqueoDMY = fechaBloqueo;
                        const partes = fechaBloqueo.split('/');
                        if (partes.length === 3) {
                          fechaBloqueoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
                        }
                      }

                      return fechaBloqueoISO === fechaCalendarioISO || fechaBloqueoDMY === fechaCalendarioDMY;
                    });

                    if (esBloqueoConfig) return 'dia-bloqueado-rojo';

                    // Validamos también si el día de la semana está cerrado por base
                    if (configuracion?.horarios) {
                      const mapaDias = { monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves', friday: 'viernes', saturday: 'sabado', sunday: 'domingo' };
                      const diaSemanaEsp = mapaDias[format(date, 'EEEE').toLowerCase()];
                      const horario = configuracion.horarios[diaSemanaEsp];
                      if (!horario || horario.inicio === horario.fin) return 'dia-bloqueado-base';
                    }
                  }
                  return null;
                }}
              />
            </div>

            {/* Columna Derecha: Grilla de Horarios */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-700 mb-4">
                  2. Horarios disponibles para {format(fechaSeleccionada, 'dd/MM/yyyy')}
                </h3>

                {loadingDisponibilidad ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Consultando agenda del especialista...</p>
                ) : horariosDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-xl">
                    No hay horarios disponibles para esta fecha. Intenta seleccionando otro día.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {horariosDisponibles.map((hora) => (
                      <button
                        key={hora}
                        onClick={() => setHoraSeleccionada(hora)}
                        className={`py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                          horaSeleccionada === hora
                            ? 'bg-red-600 text-white border-red-600 shadow'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        {hora} hs
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tarjeta de Resumen y Confirmación */}
              {horaSeleccionada && (
                <div className="mt-6 pt-6 border-t border-gray-100 bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wider">Resumen de tu Reserva</h4>
                  <div className="text-sm space-y-1 text-gray-600 mb-4">
                    <p>✨ <strong>Tratamiento:</strong> {servicioSeleccionado?.nombre || servicioSeleccionado?.nombre_servicio}</p>
                    <p>👤 <strong>Atendido por:</strong> {especialistaSeleccionado?.nombre} {especialistaSeleccionado?.apellido}</p>
                    <p>📅 <strong>Fecha:</strong> {format(fechaSeleccionada, 'dd/MM/yyyy')} a las <strong>{horaSeleccionada} hs</strong></p>
                    <p>💳 <strong>Total:</strong> ${servicioSeleccionado?.precio ?? servicioSeleccionado?.precio_base}</p>
                  </div>

                  <button
                    onClick={handleConfirmarReserva}
                    disabled={enviandoReserva}
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition shadow disabled:opacity-50"
                  >
                    {enviandoReserva ? 'Confirmando Reserva...' : 'Confirmar Reserva'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE ÉXITO PERSONALIZADO ================= */}
      {modalExitoAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✨
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-1">¡Reserva Exitosa!</h3>
            <p className="text-gray-500 text-sm mb-6">Tu turno ha sido registrado correctamente en el sistema.</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6 border border-gray-200">
              <p><strong>Servicio:</strong> {servicioSeleccionado?.nombre || servicioSeleccionado?.nombre_servicio}</p>
              <p><strong>Especialista:</strong> {especialistaSeleccionado?.nombre} {especialistaSeleccionado?.apellido}</p>
              <p><strong>Fecha:</strong> {format(fechaSeleccionada, 'dd/MM/yyyy')}</p>
              <p><strong>Hora:</strong> {horaSeleccionada} hs</p>
            </div>

            <button
              onClick={handleCerrarModal}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow"
            >
              Aceptar y Volver al Inicio
            </button>
          </div>
        </div>
      )}
   
   
   
   
   
    </div>
  );
}