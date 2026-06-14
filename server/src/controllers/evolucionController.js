import { EvolucionModel } from '../models/evolucionModel.js'
import { TurnoModel } from '../models/turnoModel.js' 
import { ESTADOS_TURNO } from '../constants/estadoTurno.js';

export const evolucionController = {
  getHistorialCliente: async (req, res) => {
    const { id_cliente } = req.params
    try {
      const historial = await EvolucionModel.getByCliente(id_cliente)
      return res.status(200).json({ success: true, data: historial })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener el historial clínico', error: error.message })
    }
  },

 createEvolucion: async (req, res) => {
    try {
        console.log("BODY RECIBIDO:", req.body); // <--- MIRA TU CONSOLA DEL SERVIDOR
        const { id_turno, ...evolucionData } = req.body;
        
        const nuevaEvolucion = await EvolucionModel.create({ id_turno, ...evolucionData });

        if (id_turno) {
            console.log("INTENTANDO ACTUALIZAR TURNO ID:", id_turno);
            await TurnoModel.updateEstado(id_turno, ESTADOS_TURNO.REALIZADO);
            console.log("TURNO ACTUALIZADO CON ÉXITO");
        } else {
            console.log("NO SE RECIBIÓ ID_TURNO, NO SE PUEDE ACTUALIZAR ESTADO");
        }

        return res.status(201).json({ success: true, data: nuevaEvolucion });
    } catch (error) {
        console.error("ERROR EN BACKEND:", error); // <--- MIRA ESTO SI DA ERROR
        return res.status(500).json({ success: false, message: error.message });
    }
},
  getEvolucionById: async (req, res) => {
    const { id_evolucion } = req.params
    try {
      const evolucion = await EvolucionModel.getById(id_evolucion)
      if (!evolucion) return res.status(404).json({ success: false, message: 'Evolución no encontrada' })
      return res.status(200).json({ success: true, data: evolucion })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener la evolución', error: error.message })
    }
  },

  getNombreCliente: async (req, res) => {
    const { id_cliente } = req.params
    try {
      const nombre = await EvolucionModel.getNombreCliente(id_cliente)
      if (!nombre) return res.status(404).json({ success: false, message: 'Cliente no encontrado' })
      return res.status(200).json({ success: true, data: nombre })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener nombre', error: error.message })
    }
  },

// actualización de evolución (nueva función)
updateEvolucion: async (req, res) => {
    const { id_evolucion } = req.params;
    try {
        const { descripcion_evolucion } = req.body;
        // Creamos la query de update en el modelo o la hacemos directo aquí
        const updated = await EvolucionModel.update(id_evolucion, descripcion_evolucion);
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
},

};