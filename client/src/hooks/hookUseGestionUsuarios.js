import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuarioService';
import { serviciosService } from '../services/servicioService';
import API from '../services/api';

export function hookUseGestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [loading, setLoading] = useState(false);

    const cargarDatos = async () => {
        try {
            const [data, svcs] = await Promise.all([usuariosService.getAll(), serviciosService.getAll()]);
            // Aseguramos que data sea un array antes de filtrar
            const listaUsuarios = Array.isArray(data) ? data : data.usuarios || [];
            setUsuarios(listaUsuarios.filter(usr => usr.nombre_rol !== 'Cliente'));
            setServicios(Array.isArray(svcs) ? svcs : svcs.servicios || []);
        } catch (error) {
            console.error("Error al cargar datos de gestión de usuarios:", error);
        }
    };

    useEffect(() => { 
        cargarDatos(); 
    }, []);

    const guardarUsuario = async (datos) => {
        setLoading(true);
        try {
            if (usuarioEditando) {
                await usuariosService.updateEmpleado(usuarioEditando.id_usuario, datos);
                setUsuarios(prev => prev.map(u => u.id_usuario === usuarioEditando.id_usuario ? { ...u, ...datos } : u));
            } else {
                await usuariosService.createEmpleado(datos);
                // Damos un pequeño respiro para asegurar que la BD procese el insert antes de recargar
                await new Promise(resolve => setTimeout(resolve, 300));
                await cargarDatos();
            }
            // 👈 Retornamos explícitamente el éxito para que la vista lo reciba bien
            return { success: true, message: `Usuario ${usuarioEditando ? 'actualizado' : 'registrado'} con éxito` };
        } catch (err) {
            console.error("Error al guardar usuario:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, esBaja) => {
        try {
            const endpoint = esBaja ? `/usuarios/${id}/baja` : `/usuarios/${id}/alta`;
            await API.patch(endpoint);
            setUsuarios(prev => prev.map(u => u.id_usuario === id ? { ...u, activo: !esBaja } : u));
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    return { usuarios, servicios, usuarioEditando, setUsuarioEditando, guardarUsuario, cambiarEstado, loading };
}