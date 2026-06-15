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
  },

  // Nuevo método en EspecialistaModel
  // En tu EspecialistaModel.js
createWithServices: async (especialistaData, serviciosIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // USAMOS ON CONFLICT para que si ya existe, no tire error, sino que lo ignore o actualice
        const queryEspecialista = `
            INSERT INTO especialista (id_usuario, especialidad)
            VALUES ($1, $2)
            ON CONFLICT (id_usuario) 
            DO UPDATE SET especialidad = EXCLUDED.especialidad
            RETURNING id_especialista;
        `;
        const res = await client.query(queryEspecialista, [especialistaData.id_usuario, especialistaData.especialidad]);
        const id_especialista = res.rows[0].id_especialista;

        // Limpiamos servicios anteriores antes de insertar los nuevos (para evitar duplicados)
        await client.query('DELETE FROM especialista_servicio WHERE id_especialista = $1', [id_especialista]);

        // Insertar servicios
        if (serviciosIds && serviciosIds.length > 0) {
            const values = serviciosIds.map((_, i) => `($1, $${i + 2})`).join(', ');
            const queryServicios = `INSERT INTO especialista_servicio (id_especialista, id_servicio) VALUES ${values};`;
            await client.query(queryServicios, [id_especialista, ...serviciosIds]);
        }

        await client.query('COMMIT');
        return { id_especialista };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
},
  // Nueva función para actualizar la configuración
  updateConfiguracion: async (id_especialista, configuracion) => {
    const query = `
      UPDATE especialista 
      SET configuracion_agenda = $1 
      WHERE id_especialista = $2
      RETURNING configuracion_agenda;
    `;
    const { rows } = await pool.query(query, [JSON.stringify(configuracion), id_especialista]);
    return rows[0];
  },

  // En models/especialistaModel.js
update: async (id_usuario, data) => {
    const query = `UPDATE especialista SET especialidad = $1 WHERE id_usuario = $2`;
    await pool.query(query, [data.especialidad, id_usuario]);
}
}