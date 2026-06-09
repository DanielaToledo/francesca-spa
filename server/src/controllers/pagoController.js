import { PagoModel } from '../models/pagoModel.js'

export const pagoController = {
  registrarPago: async (req, res) => {
    const { id_turno } = req.body
    try {
      // Validar si el turno ya tiene un pago registrado para no duplicar caja
      const pagoExistente = await PagoModel.getByTurno(id_turno)
      if (pagoExistente) {
        return res.status(400).json({ success: false, message: 'Este turno ya tiene un registro de pago asociado' })
      }

      const nuevoPago = await PagoModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Pago registrado correctamente', data: nuevoPago })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar el pago', error: error.message })
    }
  },

  getPagoPorTurno: async (req, res) => {
    const { id_turno } = req.params
    try {
      const pago = await PagoModel.getByTurno(id_turno)
      if (!pago) {
        return res.status(404).json({ success: false, message: 'No se encontró ningún pago para este turno' })
      }
      return res.status(200).json({ success: true, data: pago })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el pago', error: error.message })
    }
  },

  actualizarPago: async (req, res) => {
    const { id } = req.params // id_pago
    try {
      const pagoActualizado = await PagoModel.update(id, req.body)
      if (!pagoActualizado) {
        return res.status(404).json({ success: false, message: 'Registro de pago no encontrado' })
      }
      return res.status(200).json({ success: true, message: 'Pago actualizado con éxito', data: pagoActualizado })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar el pago', error: error.message })
    }
  }
}