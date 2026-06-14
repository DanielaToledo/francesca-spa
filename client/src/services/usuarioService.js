import API from './api'

export const usuariosService = {
  // Obtener todos los usuarios del sistema
  getAll: async () => {
    const res = await API.get('/usuarios')
    return res.data.data
  },

  // Crear un nuevo empleado (Usuario + Perfil de Especialista si corresponde)
  createEmpleado: async (empleadoData) => {
    // 1. Mapeo de roles para asegurar que el ID enviado sea el correcto
    const roles = {
      'Administrador': 1,
      'Recepcionista': 2,
      'Especialista': 3
    }
    const idRolNumerico = roles[empleadoData.rol] || 3

    // 2. Primero creamos el usuario base en la tabla 'usuario'
    const resUsuario = await API.post('/auth/register', {
      nombre: empleadoData.nombre,
      apellido: empleadoData.apellido,
      dni: empleadoData.dni,
      email: empleadoData.email,
      password: empleadoData.password,
      id_rol: idRolNumerico
    })
    
    // Obtenemos el ID del usuario recién creado
    const nuevoUsuario = resUsuario.data.data
    const id_usuario = nuevoUsuario.id_usuario

    // 3. SI es Especialista, lo vinculamos en la tabla 'especialista' y 'especialista_servicio'
    if (empleadoData.rol === 'Especialista') {
      await API.post('/especialista', {
        id_usuario: id_usuario,
        especialidad: empleadoData.especialidad || "General", 
        serviciosIds: empleadoData.serviciosIds // Array de IDs seleccionado en el formulario
      })
    }

    return nuevoUsuario
  },

  // Eliminar usuario (baja lógica)
  delete: async (id) => {
    const res = await API.delete(`/usuarios/${id}`)
    return res.data.message
  }
}