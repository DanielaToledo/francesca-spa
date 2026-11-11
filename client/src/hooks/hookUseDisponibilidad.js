import { useState, useEffect } from 'react';
import { especialistaService } from '../services/especialistaService';

export function hookUseDisponibilidad(id_especialista) {
    const [configuracion, setConfiguracion] = useState(null);
    const [diasBloqueados, setDiasBloqueados] = useState({});
    const [loading, setLoading] = useState(true);

    const cargarAgendaCompleta = async () => {
        if (!id_especialista) return;
        try {
            setLoading(true);
            const res = await especialistaService.getConfig(id_especialista);
            
            // 🌟 Extraemos limpiamente el objeto de configuración manejando la respuesta de Axios o datos directos
            const configReal = res.data?.configuracion_agenda || res.data || res;
            
            setConfiguracion(configReal);
        } catch (error) {
            console.error("Error al cargar la agenda:", error);
        } finally {
            setLoading(false);
        }
    };

    const desbloquearFecha = async (fecha) => {
        // Lógica de desbloqueo si la usas
        cargarAgendaCompleta();
    };

    useEffect(() => {
        cargarAgendaCompleta();
    }, [id_especialista]);

    return { configuracion, diasBloqueados, cargarAgendaCompleta, desbloquearFecha, loading };
}