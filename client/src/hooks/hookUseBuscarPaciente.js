import { useState } from 'react';
import { clienteService } from '../services/clienteService';

export function hookUseBuscarPaciente() {
    const [busqueda, setBusqueda] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buscado, setBuscado] = useState(false);

    const ejecutarBusqueda = async (termino) => {
        if (!termino.trim()) return;
        
        setLoading(true);
        try {
            const res = await clienteService.buscar(termino);
            setPacientes(res.data || []);
            setBuscado(true);
        } catch (error) {
            console.error("Error en búsqueda:", error);
            setPacientes([]);
        } finally {
            setLoading(false);
        }
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
        setPacientes([]);
        setBuscado(false);
    };

    return { 
        busqueda, setBusqueda, pacientes, loading, buscado, 
        ejecutarBusqueda, limpiarBusqueda 
    };
}