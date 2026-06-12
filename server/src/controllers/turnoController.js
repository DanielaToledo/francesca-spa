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

 getTurnosEspecialista: async (req, res) => {
    const { id_usuario } = req.params;
    let { fecha } = req.query;

    // Validación de seguridad en el backend
    if (!fecha || fecha === 'undefined') {
      fecha = new Date().toISOString().split('T')[0]; // Fallback a hoy
    }

    try {
      const turnos = await TurnoModel.getByEspecialista(id_usuario, fecha);
      return res.status(200).json({ success: true, data: turnos });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error de base de datos', error: error.message });
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
    },

    reprogramarTurno: async (req, res) => {
    const { id } = req.params // id_turno
    const { fecha_hora } = req.body // Nueva fecha y hora
    try {
      if (!fecha_hora) return res.status(400).json({ success: false, message: 'Falta la nueva fecha y hora' })

      const turnoReprogramado = await TurnoModel.reprogramar(id, fecha_hora)
      if (!turnoReprogramado) return res.status(404).json({ success: false, message: 'Turno no encontrado' })

      return res.status(200).json({ success: true, message: 'Turno reprogramado con éxito', data: turnoReprogramado })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al reprogramar el turno', error: error.message })
    }
  }
}