import pool from '../config/dbConfig.js'

export const ServicioModel = {
  // 1. Obtener todos los servicios
  getAll: async () => {
    const query = `
      SELECT id_servicio, nombre_servicio, descripcion, duracion_minutos, precio_base
      FROM servicio
      ORDER BY nombre_servicio ASC;
    `
    const { rows } = await pool.query(query)
    return rows
  },

  // 2. Obtener un servicio por ID
  getById: async (id) => {
    const query = `
      SELECT id_servicio, nombre_servicio, descripcion, duracion_minutos, precio_base
      FROM servicio
      WHERE id_servicio = $1;
    `
    const { rows } = await pool.query(query, [id])
    return rows[0]
  },

  // 3. Crear un nuevo servicio
  create: async (servicioData) => {
    const { nombre_servicio, descripcion, duracion_minutos, precio_base } = servicioData
    const query = `
      INSERT INTO servicio (nombre_servicio, descripcion, duracion_minutos, precio_base)
      VALUES ($1, $2, $3, $4)
      RETURNING id_servicio, nombre_servicio, descripcion, duracion_minutos, precio_base, created_at;
    `
    const { rows } = await pool.query(query, [nombre_servicio, descripcion, duracion_minutos, precio_base])
    return rows[0]
  },

  // 4. Actualizar un servicio (ideal para cuando aumentan los precios o cambia la duración)
  update: async (id, updateData) => {
    const { nombre_servicio, descripcion, duracion_minutos, precio_base } = updateData
    const query = `
      UPDATE servicio
      SET nombre_servicio = $2, descripcion = $3, duracion_minutos = $4, precio_base = $5
      WHERE id_servicio = $1
      RETURNING id_servicio, nombre_servicio, descripcion, duracion_minutos, precio_base;
    `
    const { rows } = await pool.query(query, [id, nombre_servicio, descripcion, duracion_minutos, precio_base])
    return rows[0]
  },

  // 5. Eliminar un servicio (Borrado físico directo)
  delete: async (id) => {
    const query = `
      DELETE FROM servicio
      WHERE id_servicio = $1
      RETURNING id_servicio;
    `
    const { rows } = await pool.query(query, [id])
    return rows[0]
  }
}