import { TurnoModel } from '../models/turnoModel.js'
import { BloqueoAgendaModel } from '../models/bloqueoAgendaModel.js' 

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
        const { fecha_hora } = req.body;

        // Convertimos la fecha del POST a un timestamp numérico
        const t = new Date(fecha_hora).getTime();

        const bloqueos = await BloqueoAgendaModel.getBloqueos(id_especialista);
        
        // Verificación de bloqueo: si el turno cae dentro de un rango, bloqueamos
        const estaBloqueado = bloqueos.some(bloqueo => {
            const start = new Date(bloqueo.fecha_inicio).getTime();
            const end = new Date(bloqueo.fecha_fin).getTime();
            
            return t >= start && t < end;
        });

        if (estaBloqueado) {
            return res.status(409).json({ 
                success: false, 
                message: 'No se puede agendar: este horario está bloqueado por el especialista.' 
            });
        }

        const nuevoTurno = await TurnoModel.create(req.body);
        
        return res.status(201).json({ 
            success: true, 
            message: 'Turno agendado con éxito', 
            data: nuevoTurno 
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ 
                success: false, 
                message: 'Este horario ya ha sido ocupado.' 
            });
        }
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


getResumenAgenda: async (req, res) => {
    const { id_especialista } = req.params;
    const { fecha } = req.query; // Esperamos formato 'YYYY-MM-DD'

    try {
        // Ejecutamos ambas consultas en paralelo
        const [turnos, bloqueos] = await Promise.all([
            TurnoModel.getByEspecialista(id_especialista),
            BloqueoAgendaModel.getBloqueos(id_especialista)
        ]);

        // Filtramos asegurándonos de que siempre tratamos con strings
        const turnosDia = turnos.filter(t => {
            const fechaStr = t.fecha_hora instanceof Date 
                ? t.fecha_hora.toISOString() 
                : String(t.fecha_hora);
            return fechaStr.startsWith(fecha);
        });

        const bloqueosDia = bloqueos.filter(b => {
            const fechaStr = b.fecha_inicio instanceof Date 
                ? b.fecha_inicio.toISOString() 
                : String(b.fecha_inicio);
            return fechaStr.startsWith(fecha);
        });

        return res.status(200).json({ 
            success: true, 
            data: { 
                turnos: turnosDia, 
                bloqueos: bloqueosDia 
            } 
        });
    } catch (error) {
        console.error("Error en getResumenAgenda:", error);
        return res.status(500).json({ success: false, message: 'Error al obtener resumen de la agenda' });
    }
},
}