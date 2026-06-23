import { useState, useCallback, useEffect } from 'react';
import API from '../services/api';
import { especialistaService } from '../services/especialistaService';

export function hookUseDisponibilidad(idEspecialista) {
    const [configuracion, setConfiguracion] = useState(null);
    const [listaBloqueosGlobal, setListaBloqueosGlobal] = useState([]);
    const [diasBloqueados, setDiasBloqueados] = useState({});

    const procesarBloqueos = useCallback((listaBloqueos) => {
        const mapa = {};
        if (Array.isArray(listaBloqueos)) {
            listaBloqueos.forEach(b => {
                const fecha = b.fecha_inicio.substring(0, 10);
                mapa[fecha] = (mapa[fecha] || 0) + 1;
            });
        }
        setDiasBloqueados(mapa);
    }, []);

    const cargarAgendaCompleta = useCallback(async () => {
        if (!idEspecialista) return;
        try {
            const res = await API.get(`/turnos/agenda/resumen/${idEspecialista}`);
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

    const desbloquearFecha = async (fecha) => {
        try {
            const bloqueoManual = listaBloqueosGlobal.find(b => b.fecha_inicio.startsWith(fecha));
            if (bloqueoManual && bloqueoManual.id_bloqueo) {
                await API.delete(`/bloqueos/${bloqueoManual.id_bloqueo}`);
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

    return { configuracion, diasBloqueados, cargarAgendaCompleta, desbloquearFecha };
}