import API from './api'

export const usuariosService = {
  getAll: async () => {
    const res = await API.get('/usuarios')
    return res.data.data
  },

  createEmpleado: async (empleadoData) => {
    let idRolNumerico = 3 // Por defecto Especialista
    if (empleadoData.rol === 'Administrador') idRolNumerico = 1
    if (empleadoData.rol === 'Recepcionista') idRolNumerico = 2

    const payload = {
      nombre: empleadoData.nombre,
      apellido: empleadoData.apellido,
      dni: empleadoData.dni, // <-- ¡AHORA SÍ! Mandamos el DNI real del formulario
      email: empleadoData.email,
      password: empleadoData.password,
      id_rol: idRolNumerico
    }

    const res = await API.post('/auth/register', payload) 
    return res.data.data
  },

  delete: async (id) => {
    const res = await API.delete(`/usuarios/${id}`)
    return res.data.message
  }
}