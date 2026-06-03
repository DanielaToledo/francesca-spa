import { RolModel } from '../models/rolModel.js'

export const rolController = {
  getRoles: async (req, res) => {
    try {
      const roles = await RolModel.getAll()
      return res.status(200).json({ success: true, data: roles })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener los roles', error: error.message })
    }
  }
}