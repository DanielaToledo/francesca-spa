import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 10000, 
  headers: { 'Content-Type': 'application/json' }
})

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spa_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

export default API // <-- Exportamos solo la instancia limpia