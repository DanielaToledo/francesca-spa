import { FacturaModel } from '../models/facturaModel.js'

export const facturaController = {
  emitirFactura: async (req, res) => {
    try {
      const nuevaFactura = await FacturaModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Factura emitida con éxito', data: nuevaFactura })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al emitir la factura', error: error.message })
    }
  },

  getFacturaDetalle: async (req, res) => {
    const { id } = req.params
    try {
      const factura = await FacturaModel.getById(id)
      if (!factura) {
        return res.status(404).json({ success: false, message: 'Factura no encontrada' })
      }
      return res.status(200).json({ success: true, data: factura })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el detalle de la factura', error: error.message })
    }
  }
}