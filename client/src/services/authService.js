import API from './api'

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      // CAMBIADO: Antes decía '/autenticacion/login' -> Ahora coincide con tu app.js
      const response = await API.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor' }
    }
  },

  // Registro de clientes nuevos
  register: async (datosUsuario) => {
    try {
      // CAMBIADO: Antes decía '/autenticacion/register'
      const response = await API.post('/auth/register', datosUsuario)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar el usuario' }
    }
  }
}