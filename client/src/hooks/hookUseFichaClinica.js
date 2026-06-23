import { useState, useEffect } from 'react';
import { evolucionService } from '../services/evolucionService';

export function hookUseFichaClinica(id_cliente, id_turno_recibido, id_especialista) {
    const [notas, setNotas] = useState('');
    const [productos, setProductos] = useState('');
    const [recomendaciones, setRecomendaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [nombreCliente, setNombreCliente] = useState('Cargando...');
    const [evolucionActual, setEvolucionActual] = useState(null);

    const cargarDatos = async () => {
        try {
            const resHist = await evolucionService.getHistorialPorCliente(id_cliente);
            if (resHist.success) {
                setHistorial(resHist.data);
                if (id_turno_recibido) {
                    const existente = resHist.data.find(h => h.id_turno === id_turno_recibido);
                    if (existente) {
                        setEvolucionActual(existente);
                        const desc = existente.descripcion_evolucion || '';
                        setNotas(desc.split('NOTAS: ')[1]?.split('\n\n')[0] || '');
                        setProductos(desc.split('PRODUCTOS: ')[1]?.split('\n\n')[0] || '');
                        setRecomendaciones(desc.split('RECOMENDACIONES: ')[1] || '');
                    }
                }
            }

            const resNombre = await evolucionService.getNombreCliente(id_cliente);
            if (resNombre.success) {
                setNombreCliente(`${resNombre.data.nombre} ${resNombre.data.apellido}`);
            }
        } catch (err) {
            console.error("Error cargando datos", err);
        }
    };

    useEffect(() => { cargarDatos(); }, [id_cliente, id_turno_recibido]);

    const guardarEvolucion = async () => {
        setLoading(true);
        const data = {
            id_cliente: parseInt(id_cliente),
            id_especialista: id_especialista,
            id_turno: id_turno_recibido,
            descripcion_evolucion: `NOTAS: ${notas}\n\nPRODUCTOS: ${productos}\n\nRECOMENDACIONES: ${recomendaciones}`
        };

        try {
            if (evolucionActual) {
                await evolucionService.update(evolucionActual.id_evolucion, data);
            } else {
                await evolucionService.create(data);
            }
            await cargarDatos(); // Recarga tras guardar
            return { success: true, message: evolucionActual ? 'Evolución actualizada correctamente.' : '¡Ficha guardada con éxito!' };
        } catch (err) {
            throw err; // Lanzamos el error para que el componente lo maneje
        } finally {
            setLoading(false);
        }
    };

    return { 
        notas, setNotas, productos, setProductos, recomendaciones, setRecomendaciones, 
        loading, historial, nombreCliente, evolucionActual, guardarEvolucion 
    };
}