import pool from '../config/dbConfig.js'

export const UsuarioModel = {
  // 1. Obtener todos los usuarios con su nombre de rol
  getAll: async () => {
    const query = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido, 
        u.dni, 
        u.email, 
        u.activo, 
        u.id_rol, 
        r.nombre_rol,
        e.especialidad
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN especialista e ON u.id_usuario = e.id_usuario
      ORDER BY u.id_usuario DESC;
    `
    const { rows } = await pool.query(query)
    return rows
  },

  // 2. Obtener un usuario por ID
  getById: async (id_usuario) => {
    const query = `
      SELECT u.id_usuario, u.nombre, u.apellido, u.dni, u.email, u.activo, u.id_rol, r.nombre_rol
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1;
    `
    const { rows } = await pool.query(query, [id_usuario])
    return rows[0]
  },

  // 3. Crear un Usuario
  create: async (usuarioData) => {
    const { nombre, apellido, dni, email, password_hash, id_rol } = usuarioData
    const query = `
      INSERT INTO usuario (nombre, apellido, dni, email, password_hash, id_rol)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_usuario, nombre, apellido, dni, email, id_rol, activo;
    `
    const { rows } = await pool.query(query, [nombre, apellido, dni, email, password_hash, id_rol])
    return rows[0]
  },

  // 4. Actualizar datos del usuario
  // 4. Actualizar datos del usuario
// En models/usuarioModel.js
update: async (id_usuario, updateData) => {
    const { nombre, apellido, dni, email, id_rol } = updateData;
    const query = `
      UPDATE usuario
      SET nombre = $2, apellido = $3, dni = $4, email = $5, id_rol = $6
      WHERE id_usuario = $1
      RETURNING id_usuario;
    `;
    const { rows } = await pool.query(query, [id_usuario, nombre, apellido, dni, email, id_rol]);
    return rows[0];
},

  // 5. Baja lógica
  deleteLogic: async (id_usuario) => {
    const query = `
      UPDATE usuario
      SET activo = false
      WHERE id_usuario = $1
      RETURNING id_usuario, activo;
    `
    const { rows } = await pool.query(query, [id_usuario])
    return rows[0]
  },


  // 5.1 Alta lógica (Agrega esto)
  restoreLogic: async (id_usuario) => {
    const query = `
      UPDATE usuario
      SET activo = true
      WHERE id_usuario = $1
      RETURNING id_usuario, activo;
    `
    const { rows } = await pool.query(query, [id_usuario])
    return rows[0]
  },
  // 6. Buscador inteligente
 // 6. Buscador inteligente (¡Ahora busca también por Rol!)
  searchByName: async (termino) => {
    const query = `
      SELECT u.id_usuario, u.nombre, u.apellido, u.dni, u.email, u.activo, u.id_rol, r.nombre_rol
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      WHERE 
        u.nombre ILIKE $1 
        OR u.apellido ILIKE $1
        OR r.nombre_rol ILIKE $1 -- 👈 ¡AGREGÁ ESTA LÍNEA ACÁ!
        OR CONCAT(u.nombre, ' ', u.apellido) ILIKE $1
        OR CONCAT(u.apellido, ' ', u.nombre) ILIKE $1;
    `
    const { rows } = await pool.query(query, [`%${termino}%`])
    return rows
  },
  // 7. Obtener usuarios filtrados por su ID de Rol
  getByRol: async (id_rol) => {
    const query = `
      SELECT u.id_usuario, u.nombre, u.apellido, u.dni, u.email, u.activo, u.id_rol, r.nombre_rol
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_rol = $1 AND u.activo = true
      ORDER BY u.id_usuario DESC;
    `
    const { rows } = await pool.query(query, [id_rol])
    return rows
  }
}