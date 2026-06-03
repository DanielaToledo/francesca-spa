import { ServicioModel } from '../models/servicioModel.js'

export const servicioController = {
  getServicios: async (req, res) => {
    try {
      const servicios = await ServicioModel.getAll()
      return res.status(200).json({ success: true, data: servicios })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener los servicios', error: error.message })
    }
  },

  getServicioById: async (req, res) => {
    const { id } = req.params
    try {
      const servicio = await ServicioModel.getById(id)
      if (!servicio) return res.status(404).json({ success: false, message: 'Servicio no encontrado' })
      return res.status(200).json({ success: true, data: servicio })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el servicio', error: error.message })
    }
  },

  createServicio: async (req, res) => {
    try {
      const nuevoServicio = await ServicioModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Servicio creado con éxito', data: nuevoServicio })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al crear el servicio', error: error.message })
    }
  },

  updateServicio: async (req, res) => {
    const { id } = req.params
    try {
      const actualizado = await ServicioModel.update(id, req.body)
      if (!actualizado) return res.status(404).json({ success: false, message: 'Servicio no encontrado' })
      return res.status(200).json({ success: true, message: 'Servicio actualizado con éxito', data: actualizado })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar el servicio', error: error.message })
    }
  },

  deleteServicio: async (req, res) => {
    const { id } = req.params
    try {
      const eliminado = await ServicioModel.delete(id)
      if (!eliminado) return res.status(404).json({ success: false, message: 'Servicio no encontrado' })
      return res.status(200).json({ success: true, message: 'Servicio eliminado correctamente' })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al eliminar el servicio', error: error.message })
    }
  }
}