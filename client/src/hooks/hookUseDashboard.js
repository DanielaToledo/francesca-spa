import { useState, useEffect } from 'react';
import API from '../services/api';

export function hookUseDashboard() {
    const [stats, setStats] = useState({ citasHoy: 0, personalActivo: 0, ingresosDia: 0 });
    const [loading, setLoading] = useState(true);

    const cargarMetricas = async () => {
        try {
            setLoading(true);
            // Aquí ya tienes tu instancia de AXIOS configurada en API
            const response = await API.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Error al cargar métricas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarMetricas();
    }, []);

    return { stats, loading, refresh: cargarMetricas };
}