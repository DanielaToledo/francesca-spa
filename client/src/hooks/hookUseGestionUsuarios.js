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
        const [data, svcs] = await Promise.all([usuariosService.getAll(), serviciosService.getAll()]);
        setUsuarios(data.filter(usr => usr.nombre_rol !== 'Cliente'));
        setServicios(svcs);
    };

    useEffect(() => { cargarDatos(); }, []);

    const guardarUsuario = async (datos) => {
        setLoading(true);
        try {
            if (usuarioEditando) {
                await usuariosService.updateEmpleado(usuarioEditando.id_usuario, datos);
                setUsuarios(prev => prev.map(u => u.id_usuario === usuarioEditando.id_usuario ? { ...u, ...datos } : u));
            } else {
                await usuariosService.createEmpleado(datos);
                await cargarDatos();
            }
            return { success: true, message: `Usuario ${usuarioEditando ? 'actualizado' : 'registrado'} con éxito` };
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, esBaja) => {
        const endpoint = esBaja ? `/usuarios/${id}/baja` : `/usuarios/${id}/alta`;
        await API.patch(endpoint);
        setUsuarios(prev => prev.map(u => u.id_usuario === id ? { ...u, activo: !esBaja } : u));
    };

    return { usuarios, servicios, usuarioEditando, setUsuarioEditando, guardarUsuario, cambiarEstado, loading };
}