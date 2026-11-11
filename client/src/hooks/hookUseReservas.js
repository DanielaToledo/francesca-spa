import { useState, useEffect } from 'react';
import { serviciosService } from '../services/servicioService';
import { especialistaService } from '../services/especialistaService'; // 🌟 Importamos el servicio del especialista

export function hookUseReservas(id_especialista = null) {
  const [servicios, setServicios] = useState([]);
  const [configuracionEspecialista, setConfiguracionEspecialista] = useState(null); // 🌟 Para guardar los bloqueos y horarios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la reserva en curso
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  // Cargar los servicios y la configuración del especialista al iniciar o cambiar de especialista
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Cargamos el catálogo de servicios
        const dataServicios = await serviciosService.getAll();
        setServicios(dataServicios || []);

        // 2. Si ya hay un especialista seleccionado, traemos su configuración (horarios y bloqueos)
        if (id_especialista) {
          const resConfig = await especialistaService.getConfig(id_especialista);
          const configReal = resConfig.data?.configuracion_agenda || resConfig.data || resConfig;
          setConfiguracionEspecialista(configReal);
        }

      } catch (err) {
        console.error("Error al cargar datos para la reserva:", err);
        setError("No se pudo cargar la información necesaria para la reserva.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_especialista]);

  return {
    servicios,
    configuracionEspecialista, // 🌟 Exportamos esto para usarlo en el calendario del cliente
    loading,
    error,
    servicioSeleccionado,
    setServicioSeleccionado,
    fechaSeleccionada,
    setFechaSeleccionada
  };
}