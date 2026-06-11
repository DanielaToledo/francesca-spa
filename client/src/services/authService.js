import API from './api'

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await API.post('/autenticacion/login', { email, password })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor' }
    }
  },

  // Registro de clientes nuevos
  register: async (datosUsuario) => {
    try {
      const response = await API.post('/autenticacion/register', datosUsuario)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar el usuario' }
    }
  }
}