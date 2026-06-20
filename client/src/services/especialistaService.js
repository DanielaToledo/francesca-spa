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
};