import axios from 'axios';

// Configuración base para axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

// Interceptor para incluir el token si lo necesitas
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
  // Se cambió la clave a 'configuracion_agenda' para coincidir con el backend
  // En tu especialistaService.js
updateConfig: async (id_especialista, data) => {
    return await api.put(`/especialistas/${id_especialista}/configuracion`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
},
};