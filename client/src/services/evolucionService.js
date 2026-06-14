import api from './api' // Mantenemos el import que ya tenías

export const evolucionService = {
    getHistorialPorCliente: async (id_cliente) => {
        try {
            const response = await api.get(`/evoluciones/cliente/${id_cliente}`)
            return response.data
        } catch (error) {
            console.error('Error al obtener historial:', error)
            throw error
        }
    },

    create: async (data) => { // Asegúrate de usar 'create' como esperas en el componente
        try {
            const response = await api.post('/evoluciones', data)
            return response.data
        } catch (error) {
            console.error('Error al guardar evolución:', error)
            throw error
        }
    },

    getNombreCliente: async (id_cliente) => {
        try {
            // Usamos 'api' igual que en las otras funciones
            const response = await api.get(`/evoluciones/cliente/${id_cliente}/nombre`)
            return response.data
        } catch (error) {
            console.error("Error al obtener nombre:", error)
            throw error // Lanzamos el error para que FichaClinica lo capture
        }
    },
   // En evolucionService.js
update: async (id, data) => {
    // Asegúrate de enviar solo la descripción si el backend solo recibe eso
    return await api.put(`/evoluciones/${id}`, { descripcion_evolucion: data.descripcion_evolucion });
}
}