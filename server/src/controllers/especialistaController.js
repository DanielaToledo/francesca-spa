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
    const { id_usuario, especialidad, serviciosIds } = req.body;
    console.log("Datos recibidos en controlador:", req.body); // <-- AGREGAR ESTO

    try {
      if (!serviciosIds || serviciosIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Debe seleccionar al menos un servicio' });
      }

      const nuevoEspecialista = await EspecialistaModel.createWithServices(
        { id_usuario, especialidad }, 
        serviciosIds
      );

      console.log("Resultado del modelo:", nuevoEspecialista); // <-- AGREGAR ESTO

      return res.status(201).json({ 
        success: true, 
        message: 'Especialista y servicios vinculados con éxito', 
        data: nuevoEspecialista 
      });
    } catch (error) {
      console.error("ERROR DETECTADO EN CONTROLADOR:", error); // <-- MUY IMPORTANTE
      return res.status(500).json({ 
        success: false, 
        message: 'Error al registrar el especialista', 
        error: error.message 
      });
    }
},

// Nuevos métodos para configuración de agenda
getConfiguracion: async (req, res) => {
    const { id_especialista } = req.params;
    try {
        // Forzamos una consulta fresca al modelo
        const especialista = await EspecialistaModel.getById(id_especialista);
        
        if (!especialista) return res.status(404).json({ message: 'No encontrado' });

        // Verificamos qué tiene realmente en la BD
        console.log("Configuración leída de la BD:", especialista.configuracion_agenda);

        return res.status(200).json({ 
            success: true, 
            data: { configuracion_agenda: especialista.configuracion_agenda } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
},



// En tu controllers/especialistaController.js
// En tu controllers/especialistaController.js
updateConfiguracion: async (req, res) => {
    const { id_especialista } = req.params;
    
    // Si el frontend envía el objeto plano (como vimos en tu console.log), 
    // req.body es exactamente lo que queremos.
    const configuracion = req.body; 
    console.log("Recibido en backend:", configuracion);
    

    try {
        // ¿Es esta la línea que falla?
        if (!configuracion || !configuracion.horarios) {
            console.log("Validación falló: no hay horarios");
            return res.status(400).json({ success: false, message: "Formato de configuración inválido" });
        }

        // --- SOLUCIÓN: Asegurar que se guarde como un objeto JSON puro ---
        // A veces, dependiendo de cómo esté configurado tu pool, 
        // es más seguro pasarle el objeto directo.
        const configuracionActualizada = await EspecialistaModel.updateConfiguracion(
            id_especialista, 
            configuracion // Esto es el objeto { horarios, ... }
        );

        return res.status(200).json({ 
            success: true, 
            message: "Configuración actualizada correctamente", 
            data: configuracionActualizada 
        });
    } catch (err) {
        console.error("Error en updateConfiguracion:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Error interno al guardar la configuración",
            error: err.message 
        });
    }
},

updateEspecialidad: async (req, res) => {
    const { id_especialista } = req.params;
    const { especialidad } = req.body;
    try {
        // Llamamos al método que ya tienes definido en el modelo
        await EspecialistaModel.updatePorIdEspecialista(id_especialista, { especialidad });
        return res.status(200).json({ success: true, message: 'Especialidad actualizada' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
},
}