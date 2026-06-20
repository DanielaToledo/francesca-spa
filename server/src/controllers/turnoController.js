import { TurnoModel } from '../models/turnoModel.js'
import { BloqueoAgendaModel } from '../models/bloqueoAgendaModel.js' 
import { EspecialistaModel } from '../models/especialistaModel.js' // Importamos el modelo para acceder a la configuración

export const turnoController = {
    getTurnos: async (req, res) => {
        try {
            const turnos = await TurnoModel.getAll()
            return res.status(200).json({ success: true, data: turnos })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener la agenda de turnos', error: error.message })
        }
    },

    getTurnosCliente: async (req, res) => {
        const { id_cliente } = req.params
        try {
            const turnos = await TurnoModel.getByCliente(id_cliente)
            return res.status(200).json({ success: true, data: turnos })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener los turnos del cliente', error: error.message })
        }
    },

 getTurnosEspecialista: async (req, res) => {
    const { id_usuario } = req.params;
    let { fecha } = req.query;

    // Validación de seguridad en el backend
    if (!fecha || fecha === 'undefined') {
      fecha = new Date().toISOString().split('T')[0]; // Fallback a hoy
    }

    try {
      const turnos = await TurnoModel.getByEspecialista(id_usuario, fecha);
      return res.status(200).json({ success: true, data: turnos });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error de base de datos', error: error.message });
    }
  },
  
    getTurnoById: async (req, res) => {
        const { id } = req.params // Este es el id_turno que viaja en la URL
        try {
            const turno = await TurnoModel.getById(id)
            if (!turno) {
                return res.status(404).json({ success: false, message: 'Turno no encontrado' })
            }
            return res.status(200).json({ success: true, data: turno })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener el detalle del turno', error: error.message })
        }
    },

createTurno: async (req, res) => {
    try {
        const id_especialista = Number(req.body.id_especialista);
        let { fecha_hora } = req.body; // Ejemplo: "2026-07-08T10:00"

        // ¡ESTO ES LO IMPORTANTE!
        // Convertimos el formato ISO a formato simple "YYYY-MM-DD HH:mm:ss"
        // Esto le dice a la base de datos: "No conviertas nada, guarda esto tal cual"
        const fechaLimpia = fecha_hora.replace('T', ' ');

        // Verificación de bloqueos (usando la fecha limpia)
        const bloqueos = await BloqueoAgendaModel.getBloqueos(id_especialista);
        const estaBloqueado = bloqueos.some(bloqueo => {
            const inicio = bloqueo.fecha_inicio.substring(0, 16);
            const fin = bloqueo.fecha_fin.substring(0, 16);
            return fechaLimpia.substring(0, 16) >= inicio && fechaLimpia.substring(0, 16) < fin;
        });

        if (estaBloqueado) {
            return res.status(409).json({ success: false, message: 'Horario bloqueado.' });
        }

        // Crear turno enviando la fecha limpia
        const nuevoTurno = await TurnoModel.create({
            ...req.body,
            fecha_hora: fechaLimpia // Se guarda sin la "T"
        });
        
        return res.status(201).json({ success: true, data: nuevoTurno });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
},



    cambiarEstado: async (req, res) => {
        const { id } = req.params // ID del turno
        const { id_estado_turno } = req.body // Nuevo estado (2, 3 o 4)
        try {
            if (!id_estado_turno) return res.status(400).json({ success: false, message: 'Falta el id_estado_turno' })

            const turnoActualizado = await TurnoModel.updateEstado(id, id_estado_turno)
            if (!turnoActualizado) return res.status(404).json({ success: false, message: 'Turno no encontrado' })

            return res.status(200).json({ success: true, message: 'Estado del turno actualizado con éxito', data: turnoActualizado })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al cambiar el estado del turno', error: error.message })
        }
    },

  reprogramarTurno: async (req, res) => {
    const { id } = req.params; // id_turno
    const { fecha_hora } = req.body; // Nueva fecha y hora
    
    try {
        if (!fecha_hora) return res.status(400).json({ success: false, message: 'Falta la nueva fecha y hora' });

        // 1. Obtener los datos del turno original para saber quién es el especialista
        const turnoOriginal = await TurnoModel.getById(id);
        if (!turnoOriginal) return res.status(404).json({ success: false, message: 'Turno no encontrado' });

        // 2. Obtener bloqueos del especialista
        const bloqueos = await BloqueoAgendaModel.getBloqueos(turnoOriginal.id_especialista);
        
        // 3. Normalizamos la fecha que quieren asignar para reprogramar
        const fechaNuevaLocal = new Date(fecha_hora).toISOString().slice(0, 16);
        
        // 4. Validar si el nuevo horario está bloqueado usando strings normalizados
        const estaBloqueado = bloqueos.some(bloqueo => {
            const inicioBloqueo = new Date(bloqueo.fecha_inicio).toISOString().slice(0, 16);
            const finBloqueo = new Date(bloqueo.fecha_fin).toISOString().slice(0, 16);
            
            return fechaNuevaLocal >= inicioBloqueo && fechaNuevaLocal < finBloqueo;
        });

        if (estaBloqueado) {
            return res.status(409).json({ 
                success: false, 
                message: 'No se puede reprogramar: ese horario está bloqueado por el especialista.' 
            });
        }

        // 5. Si está libre, reprogramar
        const turnoReprogramado = await TurnoModel.reprogramar(id, fecha_hora);
        return res.status(200).json({ 
            success: true, 
            message: 'Turno reprogramado con éxito', 
            data: turnoReprogramado 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Error al reprogramar el turno', 
            error: error.message 
        });
    }
},


//Actualmente, el backend hace esto en getResumenAgenda:
//Consulta tres fuentes: TurnoModel, BloqueoAgendaModel y EspecialistaModel.
//Extrae la configuración: especialista?.configuracion_agenda.
//La "desempaqueta": Si viene como string (a veces pasa con JSONB de Postgres), la intenta convertir a objeto (JSON.parse).
//La retorna: La envía junto a los turnos y bloqueos en el mismo JSON.
getResumenAgenda: async (req, res) => {
    const { id_especialista } = req.params;
    try {
        const [turnos, bloqueos, especialista] = await Promise.all([
            TurnoModel.getByEspecialista(id_especialista),
            BloqueoAgendaModel.getBloqueos(id_especialista),
            EspecialistaModel.getById(id_especialista)
        ]);

        // AGREGAMOS ESTE LOG PARA VER LA VERDAD
        console.log("ESPECIALISTA LEÍDO DE DB:", JSON.stringify(especialista, null, 2));

        let config = especialista?.configuracion_agenda || {};
        
        if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch(e) { config = {}; }
        }

        console.log("CONFIG FINAL A ENVIAR:", JSON.stringify(config, null, 2));

        return res.status(200).json({ 
            success: true, 
            data: { 
                bloqueos: bloqueos || [], 
                turnos: turnos || [],
                configuracion_agenda: config 
            } 
        });
    } catch (error) {
        console.error("ERROR EN RESUMEN:", error);
        return res.status(500).json({ success: false, message: 'Error' });
    }
},
}