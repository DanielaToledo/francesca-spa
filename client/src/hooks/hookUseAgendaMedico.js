import { useState, useEffect } from 'react';
import { turnoService } from '../services/turnoService';
import { especialistaService } from '../services/especialistaService';

export function hookUseAgendaMedico(user, filtroFecha) {
    const [turnos, setTurnos] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatosAgenda = async () => {
        const idParaConsultar = user?.id_especialista || user?.id_usuario;
        if (!idParaConsultar) return;

        try {
            setLoading(true);
            setError(null);

            const [resTurnos, resConfig] = await Promise.all([
                turnoService.getTurnosEspecialista(idParaConsultar),
                especialistaService.getConfig(idParaConsultar)
            ]);

            // 🌟 1. Asignamos la configuración de forma independiente y robusta
            const dataConfig = resConfig?.data?.configuracion_agenda || resConfig?.data || null;
            setConfig(dataConfig);

            // 🌟 2. Procesamos los turnos de manera segura
            const todosLosTurnos = resTurnos?.data || resTurnos || [];
            const turnosArray = Array.isArray(todosLosTurnos) ? todosLosTurnos : (todosLosTurnos.turnos || []);

            const turnosFiltrados = turnosArray.filter(turno => {
                if (!turno.fecha_hora) return false;
                return turno.fecha_hora.substring(0, 10) === filtroFecha;
            });
            
            setTurnos(turnosFiltrados);

        } catch (err) {
            console.error("Error al cargar datos de la agenda:", err);
            setError('No se pudo cargar la agenda.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) cargarDatosAgenda();
    }, [user, filtroFecha]);

    return { turnos, config, loading, error, recargarAgenda: cargarDatosAgenda };
}