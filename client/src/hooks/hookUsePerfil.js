import { useState, useEffect } from 'react';
import { especialistaService } from '../services/especialistaService';

export function hookUsePerfil(id_especialista) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lógica de carga
    useEffect(() => {
        if (!id_especialista) return;

        const cargarConfig = async () => {
            try {
                const res = await especialistaService.getConfig(id_especialista);
                const dataBackend = res.data?.configuracion_agenda;
                const configDefault = { horarios: {}, bloqueos: [], duracion_turno: 60 };
                setConfig(dataBackend || configDefault);
            } catch (error) {
                console.error("Error al cargar configuración:", error);
                setConfig({ horarios: {}, bloqueos: [], duracion_turno: 60 });
            }
        };
        cargarConfig();
    }, [id_especialista]);

    // Lógica de guardado
    const saveConfig = async (nuevaConfig) => {
        setLoading(true);
        try {
            await especialistaService.updateConfig(id_especialista, nuevaConfig);
            setConfig(nuevaConfig);
            alert('¡Configuración guardada correctamente!');
        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Hubo un error al intentar guardar.');
        } finally {
            setLoading(false);
        }
    };

    return { config, loading, saveConfig };
}