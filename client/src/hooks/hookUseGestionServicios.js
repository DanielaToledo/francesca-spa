import { useState, useEffect } from 'react';
import { serviciosService } from '../services/servicioService';

export function hookUseGestionServicios() {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarServicios = async () => {
        try {
            setLoading(true);
            const data = await serviciosService.getAll();
            setServicios(data);
        } catch (err) {
            setError('No se pudieron cargar los servicios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarServicios(); }, []);

    const guardarServicio = async (id, datos) => {
        if (id) {
            await serviciosService.update(id, datos);
        } else {
            await serviciosService.create(datos);
        }
        await cargarServicios();
    };

    const eliminarServicio = async (id) => {
        await serviciosService.delete(id);
        setServicios(prev => prev.filter(s => s.id_servicio !== id));
    };

    return { servicios, loading, error, guardarServicio, eliminarServicio };
}