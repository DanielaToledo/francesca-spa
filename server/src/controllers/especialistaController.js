import { EspecialistaModel } from '../models/especialistaModel.js'

export const especialistaController = {
  getEspecialistas: async (req, res) => {
    try {
      const especialistas = await EspecialistaModel.getAll()
      return res.status(200).json({ success: true, data: especialistas })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener especialistas', error: error.message })
    }
  },

  getEspecialistaById: async (req, res) => {
    const { id } = req.params
    try {
      const especialista = await EspecialistaModel.getById(id)
      if (!especialista) return res.status(404).json({ success: false, message: 'Especialista no encontrado' })
      return res.status(200).json({ success: true, data: especialista })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el especialista', error: error.message })
    }
  },

  createEspecialista: async (req, res) => {
    try {
      const nuevoEspecialista = await EspecialistaModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Especialista vinculado con éxito', data: nuevoEspecialista })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al vincular especialista', error: error.message })
    }
  }
}