import pool from '../config/dbConfig.js'

export const ClientModel = {
  // 1. Obtener todos (Ya lo tenías, lo dejamos impecable)
  getAll: async () => {
    const query = `
      SELECT c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.dni, u.email, c.telefono, c.antecedentes_medicos, u.activo
      FROM cliente c
      INNER JOIN usuario u ON c.id_usuario = u.id_usuario
      ORDER BY c.id_cliente DESC;
    `
    const { rows } = await pool.query(query)
    return rows
  },

  // 2. Crear Cliente (Inserta en Usuario y luego en Cliente)
  create: async (clientData) => {
    const { nombre, apellido, dni, email, password_hash, id_rol, telefono, antecedentes_medicos } = clientData
    
    // Iniciamos una transacción manual para asegurar ambas inserciones
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Paso A: Insertar en la tabla usuario
      const userQuery = `
        INSERT INTO usuario (nombre, apellido, dni, email, password_hash, id_rol)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_usuario;
      `
      const userResult = await client.query(userQuery, [nombre, apellido, dni, email, password_hash, id_rol || 4]) // 4 es rol Cliente
      const id_usuario = userResult.rows[0].id_usuario

      // Paso B: Insertar en la tabla cliente usando el id_usuario recién creado
      const clientQuery = `
        INSERT INTO cliente (id_usuario, telefono, antecedentes_medicos)
        VALUES ($1, $2, $3)
        RETURNING *;
      `
      const clientResult = await client.query(clientQuery, [id_usuario, telefono, antecedentes_medicos])
      
      await client.query('COMMIT')
      
      return { id_usuario, ...clientResult.rows[0], nombre, apellido, email }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  // 3. Actualizar Cliente
  update: async (id_cliente, updateData) => {
    const { nombre, apellido, dni, email, telefono, antecedentes_medicos } = updateData
    
    const query = `
      WITH updated_client AS (
        UPDATE cliente 
        SET telefono = $2, antecedentes_medicos = $3
        WHERE id_cliente = $1
        RETURNING id_usuario, id_cliente, telefono, antecedentes_medicos
      )
      UPDATE usuario u
      SET nombre = $4, apellido = $5, dni = $6, email = $7
      FROM updated_client uc
      WHERE u.id_usuario = uc.id_usuario
      RETURNING uc.id_cliente, u.nombre, u.apellido, u.dni, u.email, uc.telefono, uc.antecedentes_medicos;
    `
    const { rows } = await pool.query(query, [id_cliente, telefono, antecedentes_medicos, nombre, apellido, dni, email])
    return rows[0]
  },

  // 4. Baja Lógica (Desactivar usuario)
  deleteLogic: async (id_cliente) => {
    const query = `
      UPDATE usuario 
      SET activo = false
      WHERE id_usuario = (SELECT id_usuario FROM cliente WHERE id_cliente = $1)
      RETURNING id_usuario, activo;
    `
    const { rows } = await pool.query(query, [id_cliente])
    return rows[0]
  },

  // 5. Buscar un cliente específico por su ID
  getById: async (id_cliente) => {
    const query = `
      SELECT c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.dni, u.email, c.telefono, c.antecedentes_medicos, u.activo
      FROM cliente c
      INNER JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_cliente = $1;
    `
    const { rows } = await pool.query(query, [id_cliente])
    return rows[0] // Devolvemos solo el primero porque el ID es único
  },

  // 6. Buscar clientes por nombre o apellido (Filtro buscador)
// 6. Buscar clientes por nombre, apellido o ambos combinados
  searchByName: async (termino) => {
    const query = `
      SELECT c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.dni, u.email, c.telefono, c.antecedentes_medicos, u.activo
      FROM cliente c
      INNER JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE 
        u.nombre ILIKE $1 
        OR u.apellido ILIKE $1
        OR CONCAT(u.nombre, ' ', u.apellido) ILIKE $1
        OR CONCAT(u.apellido, ' ', u.nombre) ILIKE $1;
    `
    // El % al principio y al final permite buscar partes del texto
    const { rows } = await pool.query(query, [`%${termino}%`])
    return rows
  }




}