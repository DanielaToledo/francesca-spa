import axios from 'axios'

// 1. Configuramos la URL base de tu servidor Express
const API = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json' // Asegura que el servidor sepa que estamos enviando JSON
  }
})

// 2. INTERCEPTOR: Inyecta el Token en las cabeceras automáticamente en cada viaje
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spa_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default API