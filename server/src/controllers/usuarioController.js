import { UsuarioModel } from '../models/usuarioModel.js' // <-- Cambiado a singular

export const usuarioController = {
  getUsuarios: async (req, res) => {
    try {
      const usuarios = await UsuarioModel.getAll()
      return res.status(200).json({ success: true, data: usuarios })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message })
    }
  },

  getUsuarioById: async (req, res) => {
    const { id } = req.params
    try {
      const usuario = await UsuarioModel.getById(id)
      if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return res.status(200).json({ success: true, data: usuario })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el usuario', error: error.message })
    }
  },

  createUsuario: async (req, res) => {
    try {
      const nuevoUsuario = await UsuarioModel.create(req.body)
      return res.status(201).json({ success: true, message: 'Usuario creado con éxito', data: nuevoUsuario })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message })
    }
  },

  updateUsuario: async (req, res) => {
    const { id } = req.params
    try {
      const actualizado = await UsuarioModel.update(id, req.body)
      if (!actualizado) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return res.status(200).json({ success: true, message: 'Usuario actualizado con éxito', data: actualizado })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message })
    }
  },

  deleteUsuario: async (req, res) => {
    const { id } = req.params
    try {
      const desactivado = await UsuarioModel.deleteLogic(id)
      if (!desactivado) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return res.status(200).json({ success: true, message: 'Usuario desactivado correctamente' })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al desactivar usuario', error: error.message })
    }
  },

  searchUsuarios: async (req, res) => {
    const { nombre } = req.query
    try {
      if (!nombre) return res.status(400).json({ success: false, message: 'Falta el término de búsqueda' })
      const usuarios = await UsuarioModel.searchByName(nombre)
      return res.status(200).json({ success: true, data: usuarios })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error en la búsqueda de usuarios', error: error.message })
    }
  },

  // Filtrar usuarios por rol
  getUsuariosByRol: async (req, res) => {
    const { id_rol } = req.query // Captura el ?id_rol=...
    try {
      if (!id_rol) return res.status(400).json({ success: false, message: 'Falta el ID del rol' })
      
      const usuarios = await UsuarioModel.getByRol(id_rol)
      return res.status(200).json({ success: true, data: usuarios })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al filtrar usuarios por rol', error: error.message })
    }
  }
}