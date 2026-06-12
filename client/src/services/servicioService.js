import API from './api' // Importamos el motor

// Servicio para manejar servicios (tratamientos) por parte de la administración
export const serviciosService = {
  getAll: async () => {
    const res = await API.get('/servicios')
    return res.data.data 
  },
  create: async (servicioData) => {
    const res = await API.post('/servicios', servicioData)
    return res.data.data
  },
  update: async (id, servicioData) => {
    const res = await API.put(`/servicios/${id}`, servicioData)
    return res.data.data
  },
  delete: async (id) => {
    const res = await API.delete(`/servicios/${id}`)
    return res.data.message
  }
}