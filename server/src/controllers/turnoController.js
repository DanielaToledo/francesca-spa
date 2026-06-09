import { TurnoModel } from '../models/turnoModel.js'

export const turnoController = {
    getTurnos: async (req, res) => {
        try {
            const turnos = await TurnoModel.getAll()
            return res.status(200).json({ success: true, data: turnos })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener la agenda de turnos', error: error.message })
        }
    },

    getTurnosCliente: async (req, res) => {
        const { id_cliente } = req.params
        try {
            const turnos = await TurnoModel.getByCliente(id_cliente)
            return res.status(200).json({ success: true, data: turnos })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener los turnos del cliente', error: error.message })
        }
    },

    getTurnoById: async (req, res) => {
        const { id } = req.params // Este es el id_turno que viaja en la URL
        try {
            const turno = await TurnoModel.getById(id)
            if (!turno) {
                return res.status(404).json({ success: false, message: 'Turno no encontrado' })
            }
            return res.status(200).json({ success: true, data: turno })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener el detalle del turno', error: error.message })
        }
    },

    createTurno: async (req, res) => {
        try {
            const nuevoTurno = await TurnoModel.create(req.body)
            return res.status(201).json({ success: true, message: 'Turno agendado con éxito', data: nuevoTurno })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al agendar el turno', error: error.message })
        }
    },

    cambiarEstado: async (req, res) => {
        const { id } = req.params // ID del turno
        const { id_estado_turno } = req.body // Nuevo estado (2, 3 o 4)
        try {
            if (!id_estado_turno) return res.status(400).json({ success: false, message: 'Falta el id_estado_turno' })

            const turnoActualizado = await TurnoModel.updateEstado(id, id_estado_turno)
            if (!turnoActualizado) return res.status(404).json({ success: false, message: 'Turno no encontrado' })

            return res.status(200).json({ success: true, message: 'Estado del turno actualizado con éxito', data: turnoActualizado })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al cambiar el estado del turno', error: error.message })
        }
    }
}