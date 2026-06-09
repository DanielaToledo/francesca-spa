import { EvolucionModel } from '../models/evolucionModel.js'

export const evolucionController = {
  getHistorialCliente: async (req, res) => {
    const { id_cliente } = req.params
    try {
      const historial = await EvolucionModel.getByCliente(id_cliente)
      return res.status(200).json({ success: true, data: historial })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el historial clínico', error: error.message })
    }
  },

  createEvolucion: async (req, res) => {
    try {
      const nuevaEvolucion = await EvolucionModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Evolución médica registrada con éxito', data: nuevaEvolucion })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar la evolución médica', error: error.message })
    }
  }
}