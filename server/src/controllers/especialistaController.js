import { EspecialistaModel } from '../models/especialistaModel.js'

export const especialistaController = {
  getEspecialistas: async (req, res) => {
    try {
      const especialistas = await EspecialistaModel.getAll()
      return res.status(200).json({ success: true, data: especialistas })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener especialistas', error: error.message })
    }
  },

  getEspecialistaById: async (req, res) => {
    const { id } = req.params
    try {
      const especialista = await EspecialistaModel.getById(id)
      if (!especialista) return res.status(404).json({ success: false, message: 'Especialista no encontrado' })
      return res.status(200).json({ success: true, data: especialista })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el especialista', error: error.message })
    }
  },

 createEspecialista: async (req, res) => {
    // Extraemos id_usuario, especialidad y los servicios seleccionados (serviciosIds)
    const { id_usuario, especialidad, serviciosIds } = req.body;

    try {
      // Validamos que al menos haya un servicio seleccionado
      if (!serviciosIds || serviciosIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar al menos un servicio' });
      }

      // Llamamos al modelo que maneja la transacción
      const nuevoEspecialista = await EspecialistaModel.createWithServices(
        { id_usuario, especialidad }, 
        serviciosIds
      );

      return res.status(201).json({ 
        success: true, 
        message: 'Especialista y servicios vinculados con éxito', 
        data: nuevoEspecialista 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error al registrar el especialista', 
        error: error.message 
      });
    }
  },

// En especialistasController.js
getConfiguracion: async (req, res) => {
    const { id_especialista } = req.params;
    try {
        const especialista = await EspecialistaModel.getById(id_especialista);
        
        // ¡OJO AQUÍ! Verifica qué trae 'especialista'. 
        // Si tu base de datos tiene la columna 'configuracion_agenda', accedes a ella:
        const config = especialista.configuracion_agenda || {}; 
        
        // Asegúrate de enviar 'data' dentro de la respuesta
        return res.status(200).json({ success: true, data: config });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
},

  updateConfiguracion: async (req, res) => {
    const { id_especialista } = req.params;
    const { configuracion } = req.body; // El objeto JSON completo
    try {
      const updated = await EspecialistaModel.updateConfiguracion(id_especialista, configuracion);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

}