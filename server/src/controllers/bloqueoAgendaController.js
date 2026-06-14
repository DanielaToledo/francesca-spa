import { BloqueoAgendaModel } from '../models/bloqueoAgendaModel.js';

export const BloqueoAgendaController = {
    // Crear un nuevo bloqueo tras verificar conflictos
    registrarBloqueo: async (req, res) => {
        try {
            const { id_especialista, fecha_inicio, fecha_fin, motivo } = req.body;

            // 1. Validar conflictos: ¿Hay turnos en este rango?
            const tieneTurnos = await BloqueoAgendaModel.verificarTurnosEnRango(
                id_especialista, 
                fecha_inicio, 
                fecha_fin
            );

            if (tieneTurnos) {
                return res.status(409).json({ 
                    success: false, 
                    message: "No se puede bloquear: existen turnos confirmados en este horario." 
                });
            }

            // 2. Si no hay turnos, procedemos a bloquear
            const nuevoBloqueo = await BloqueoAgendaModel.crearBloqueo({
                id_especialista, 
                fecha_inicio, 
                fecha_fin, 
                motivo
            });

            return res.status(201).json({ success: true, data: nuevoBloqueo });
        } catch (error) {
            console.error("Error en registrarBloqueo:", error);
            return res.status(500).json({ success: false, message: "Error interno del servidor" });
        }
    },

    // Listar todos los bloqueos de un especialista
    obtenerBloqueos: async (req, res) => {
        try {
            const { id_especialista } = req.params;
            const bloqueos = await BloqueoAgendaModel.getBloqueos(id_especialista);
            return res.status(200).json({ success: true, data: bloqueos });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Error al obtener bloqueos" });
        }
    },

    eliminarBloqueo: async (req, res) => {
    try {
        const { id_bloqueo } = req.params; // Necesitamos el ID del bloqueo
        await BloqueoAgendaModel.eliminarBloqueo(id_bloqueo);
        return res.status(200).json({ success: true, message: "Bloqueo eliminado" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error al eliminar" });
    }
}
};