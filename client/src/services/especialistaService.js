// src/services/especialistaService.js
import api from './api'; 

/**
 * Servicio para gestionar la configuración de los especialistas.
 * La configuración del token (interceptor) ya está definida en 'api.js'.
 */
export const especialistaService = {
  
  // Obtener configuración del especialista
  getConfig: async (id_especialista) => {
    try {
      const response = await api.get(`/especialistas/${id_especialista}/configuracion`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener la configuración:", error);
      throw error;
    }
  },

  // Actualizar configuración del especialista
  updateConfig: async (id_especialista, data) => {
    try {
      const response = await api.put(`/especialistas/${id_especialista}/configuracion`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      throw error;
    }
  },



  // 🌟 NUEVO: Obtener especialistas filtrados por el ID del servicio
  getByServicio: async (id_servicio) => {
    try {
      const response = await api.get(`/especialistas/servicio/${id_servicio}`); // Asegúrate de que la ruta coincida con tu router de backend
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener especialistas por servicio:", error);
      throw error;
    }
  },
};