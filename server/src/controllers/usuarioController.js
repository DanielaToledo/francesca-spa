//2. usuarioController.js (Tu administrador de la tabla usuario)
// Este archivo debería ser el encargado de las operaciones de CRUD (Crear, Leer, Actualizar, Borrar) sobre la tabla usuario.

// Su trabajo es listar usuarios, editar sus datos (nombre, apellido, email), o dar de baja a un usuario.

// Cuando tu Admin entra a la pantalla de "Gestión de Personal" y le da al botón "Guardar", lo lógico es que esa petición vaya a usuarioController.js, no a authController.js.
import { UsuarioModel } from '../models/usuarioModel.js' // <-- Cambiado a singular
import { EspecialistaModel } from '../models/especialistaModel.js' // Importamos el modelo de especialista



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

  // En tu controllers/usuarioController.js
  createUsuario: async (req, res) => {
    // Recibimos rol y especialidad del formulario
    const { nombre, apellido, email, password, rol, especialidad } = req.body;

    try {
      // 1. Creamos el usuario
      const nuevoUsuario = await UsuarioModel.create({ nombre, apellido, email, password });

      // 2. Si es especialista, lo anidamos de una vez
      if (rol === 'Especialista') {
        await EspecialistaModel.create({
          id_usuario: nuevoUsuario.id_usuario,
          especialidad: especialidad
        });
      }

      return res.status(201).json({ success: true, data: nuevoUsuario });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
  },

updateUsuario: async (req, res) => {
    const { id } = req.params; // Este es tu id_usuario
    const { nombre, apellido, dni, email, id_rol, especialidad } = req.body;
    
    try {
        // 1. Actualizar datos básicos en tabla 'usuario'
        const actualizado = await UsuarioModel.update(id, { nombre, apellido, dni, email, id_rol });
        
        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // 2. Si es especialista (id_rol === 3), actualizamos su especialidad
        if (id_rol === 3) {
            // Nota: Aquí pasamos el 'id' (que es el id_usuario) 
            // porque tu EspecialistaModel.update ya hace el WHERE por id_usuario.
            await EspecialistaModel.update(id, { especialidad }); 
        }
        
        return res.status(200).json({ success: true, message: 'Usuario actualizado con éxito' });
    } catch (error) {
        console.error("Error en updateUsuario:", error); // Útil para ver el error real en la terminal
        return res.status(500).json({ success: false, message: 'Error al actualizar', error: error.message });
    }
  },

  
 // En usuarioController.js
darDeBaja: async (req, res) => {
    const { id } = req.params; // Asegúrate que tu ruta le pase este parámetro
    try {
      const usuarioDesactivado = await UsuarioModel.deleteLogic(id);
      
      // Si el modelo retorna algo, significa que se desactivó correctamente
      if (!usuarioDesactivado) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Usuario desactivado correctamente',
        data: usuarioDesactivado 
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al desactivar', error: error.message });
    }
  },
// En usuarioController.js
darDeAlta: async (req, res) => {
    const { id } = req.params;
    try {
        // Ahora usamos el modelo, tal como hacemos con la baja
        const usuarioActivado = await UsuarioModel.restoreLogic(id);
        
        if (!usuarioActivado) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ success: true, message: 'Usuario reactivado', data: usuarioActivado });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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