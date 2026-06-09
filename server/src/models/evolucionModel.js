import pool from '../config/dbConfig.js'

export const EvolucionModel = {
  // 1. Obtener el historial clínico completo de un Cliente
  getByCliente: async (id_cliente) => {
    const query = `
      SELECT 
        e.id_evolucion,
        e.descripcion_evolucion,
        e.fecha_registro,
        e.id_turno,
        (u_esp.nombre || ' ' || u_esp.apellido) AS especialista_nombre,
        esp.especialidad,
        s.nombre_servicio
      FROM evoluciones_medicas e
      INNER JOIN especialista esp ON e.id_especialista = esp.id_especialista
      INNER JOIN usuario u_esp ON esp.id_usuario = u_esp.id_usuario
      INNER JOIN turno t ON e.id_turno = t.id_turno
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      WHERE e.id_cliente = $1
      ORDER BY e.fecha_registro DESC;
    `
    const { rows } = await pool.query(query, [id_cliente])
    return rows
  },

  // 2. Crear una nueva evolución médica
  create: async (evolucionData) => {
    const { id_cliente, id_especialista, id_turno, descripcion_evolucion } = evolucionData
    const query = `
      INSERT INTO evoluciones_medicas (id_cliente, id_especialista, id_turno, descripcion_evolucion)
      VALUES ($1, $2, $3, $4)
      RETURNING id_evolucion, id_cliente, id_especialista, id_turno, descripcion_evolucion, fecha_registro;
    `
    const { rows } = await pool.query(query, [id_cliente, id_especialista, id_turno, descripcion_evolucion])
    return rows[0]
  }
}