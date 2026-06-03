import pool from '../config/dbConfig.js'

export const EspecialistaModel = {
  // 1. Obtener todos los especialistas con sus datos de usuario
  getAll: async () => {
    const query = `
      SELECT e.id_especialista, e.especialidad, u.nombre, u.apellido, u.email, u.activo
      FROM especialista e
      INNER JOIN usuario u ON e.id_usuario = u.id_usuario
      WHERE u.activo = true
      ORDER BY e.id_especialista DESC;
    `
    const { rows } = await pool.query(query)
    return rows
  },

  // 2. Obtener un especialista por su ID
  getById: async (id_especialista) => {
    const query = `
      SELECT e.id_especialista, e.especialidad, u.nombre, u.apellido, u.email, u.activo, e.id_usuario
      FROM especialista e
      INNER JOIN usuario u ON e.id_usuario = u.id_usuario
      WHERE e.id_especialista = $1;
    `
    const { rows } = await pool.query(query, [id_especialista])
    return rows[0]
  },

  // 3. Vincular un usuario existente como Especialista
  create: async (especialistaData) => {
    const { id_usuario, especialidad } = especialistaData
    const query = `
      INSERT INTO especialista (id_usuario, especialidad)
      VALUES ($1, $2)
      RETURNING id_especialista, id_usuario, especialidad, created_at;
    `
    const { rows } = await pool.query(query, [id_usuario, especialidad])
    return rows[0]
  }
}