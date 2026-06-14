import axios from 'axios';

// Configuración base para axios (asegúrate de que el puerto 3000 sea el de tu backend)
const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

// Interceptor para incluir el token si lo necesitas (opcional, si usas AuthContext)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const especialistaService = {
  // Obtener configuración (GET /api/especialistas/:id_especialista/configuracion)
  getConfig: async (id_especialista) => {
    const response = await api.get(`/especialistas/${id_especialista}/configuracion`);
    return response.data;
  },

  // Guardar configuración (PUT /api/especialistas/:id_especialista/configuracion)
  updateConfig: async (id_especialista, configuracion) => {
    const response = await api.put(`/especialistas/${id_especialista}/configuracion`, { 
      configuracion 
    });
    return response.data;
  }
};