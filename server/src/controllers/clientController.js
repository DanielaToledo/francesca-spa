import { ClientModel } from '../models/clientModel.js'

export const clientController = {
  // Obtener todos
  getClients: async (req, res) => {
    try {
      const clients = await ClientModel.getAll()
      return res.status(200).json({ success: true, data: clients })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener clientes', error: error.message })
    }
  },

  // Crear nuevo cliente
  createClient: async (req, res) => {
    try {
      const newClient = await ClientModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Cliente creado con éxito', data: newClient })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al crear cliente', error: error.message })
    }
  },

  // Actualizar cliente
  updateClient: async (req, res) => {
    const { id } = req.params
    try {
      const updated = await ClientModel.update(id, req.body)
      if (!updated) return res.status(404).json({ success: false, message: 'Cliente no encontrado' })
      return res.status(200).json({ success: true, message: 'Cliente actualizado con éxito', data: updated })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar cliente', error: error.message })
    }
  },

  // Dar de baja (Desactivar)
  deleteClient: async (req, res) => {
    const { id } = req.params
    try {
      const deactivated = await ClientModel.deleteLogic(id)
      if (!deactivated) return res.status(404).json({ success: false, message: 'Cliente no encontrado' })
      return res.status(200).json({ success: true, message: 'Cliente desactivado correctamente (Baja lógica)' })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al dar de baja al cliente', error: error.message })
    }
  },

  // Obtener un cliente por ID
  getClientById: async (req, res) => {
    const { id } = req.params
    try {
      const client = await ClientModel.getById(id)
      if (!client) return res.status(404).json({ success: false, message: 'Cliente no encontrado' })
      return res.status(200).json({ success: true, data: client })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el cliente', error: error.message })
    }
  },

  // Buscar clientes por nombre
  // Buscar clientes por nombre
  searchClients: async (req, res) => {
    const { q } = req.query; // Cambiamos 'nombre' por 'q'
    try {
      // Si no viene q, buscamos todos o devolvemos error. 
      // Por ahora, si está vacío, podemos devolver una lista vacía o todos.
      if (!q) {
        const clients = await ClientModel.getAll();
        return res.status(200).json({ success: true, data: clients });
      }
      
      const clients = await ClientModel.searchByName(q);
      return res.status(200).json({ success: true, data: clients });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error en la búsqueda', error: error.message });
    }
  }




}