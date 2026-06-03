import pool from '../config/dbConfig.js'

export const RolModel = {
  // Obtener la lista de todos los roles disponibles para los formularios
  getAll: async () => {
    const query = `
      SELECT id_rol, nombre_rol 
      FROM rol 
      ORDER BY id_rol ASC;
    `
    const { rows } = await pool.query(query)
    return rows
  }
}