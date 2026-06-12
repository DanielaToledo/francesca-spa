import api from './api' // Importamos la configuración base de Axios que ya tenés armada

export const turnoService = {
    // 1. 🚀 NUEVO: Traer los turnos específicos del especialista logueado
    getTurnosEspecialista: async (idUsuario, fecha) => {
        try {
            // Ejemplo: /turnos/especialista/3?fecha=2026-06-12
            const response = await api.get(`/turnos/especialista/${idUsuario}?fecha=${fecha}`)
            return response.data
        } catch (error) {
            console.error('Error en getTurnosEspecialista:', error)
            throw error
        }
    },

    // 2. Traer todos los turnos (Agenda General para la Recepción)
    getTurnos: async () => {
        try {
            const response = await api.get('/turnos')
            return response.data
        } catch (error) {
            console.error('Error en getTurnos:', error)
            throw error
        }
    },

    // 3. Traer los turnos específicos de un cliente
    getTurnosCliente: async (idCliente) => {
        try {
            const response = await api.get(`/turnos/cliente/${idCliente}`)
            return response.data
        } catch (error) {
            console.error('Error en getTurnosCliente:', error)
            throw error
        }
    },

    // 4. Agendar un nuevo turno
    createTurno: async (turnoData) => {
        try {
            const response = await api.post('/turnos', turnoData)
            return response.data
        } catch (error) {
            console.error('Error en createTurno:', error)
            throw error
        }
    },

    // 5. Cambiar el estado de un turno (Confirmado, Atendido, Cancelado)
    cambiarEstado: async (idTurno, idEstadoTurno) => {
        try {
            // Usamos patch porque tu ruta en Express está como router.patch('/:id/estado')
            const response = await api.patch(`/turnos/${idTurno}/estado`, { id_estado_turno: idEstadoTurno })
            return response.data
        } catch (error) {
            console.error('Error en cambiarEstado:', error)
            throw error
        }
    },

    // 6. Reprogramar la fecha y hora de un turno
    reprogramarTurno: async (idTurno, nuevaFechaHora) => {
        try {
            const response = await api.put(`/turnos/${idTurno}/reprogramar`, { fecha_hora: nuevaFechaHora })
            return response.data
        } catch (error) {
            console.error('Error en reprogramarTurno:', error)
            throw error
        }
    }
}