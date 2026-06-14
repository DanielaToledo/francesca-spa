import pool from '../config/dbConfig.js'

export const TurnoModel = {
    // 1. Obtener la agenda completa
    getAll: async () => {
        const query = `
      SELECT 
        t.id_turno, -- <-- Corregido acá (singular)
        t.fecha_hora,
        t.id_cliente,
        (u_cli.nombre || ' ' || u_cli.apellido) AS cliente_nombre,
        t.id_especialista,
        (u_esp.nombre || ' ' || u_esp.apellido) AS especialista_nombre,
        e.especialidad,
        t.id_servicio,
        s.nombre_servicio,
        s.duracion_minutos,
        s.precio_base,
        t.id_estado_turno,
        et.nombre_estado
      FROM turno t
      INNER JOIN cliente c ON t.id_cliente = c.id_cliente
      INNER JOIN usuario u_cli ON c.id_usuario = u_cli.id_usuario
      INNER JOIN especialista e ON t.id_especialista = e.id_especialista
      INNER JOIN usuario u_esp ON e.id_usuario = u_esp.id_usuario
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      INNER JOIN estado_turno et ON t.id_estado_turno = et.id_estado_turno
      ORDER BY t.fecha_hora DESC;
    `
        const { rows } = await pool.query(query)
        return rows
    },

    // 2. Obtener los turnos específicos de un Cliente
    getByCliente: async (id_cliente) => {
        const query = `
      SELECT 
        t.id_turno, -- <-- Corregido acá (singular)
        t.fecha_hora,
        (u_esp.nombre || ' ' || u_esp.apellido) AS especialista_nombre,
        s.nombre_servicio, s.duracion_minutos, s.precio_base,
        et.nombre_estado
      FROM turno t
      INNER JOIN especialista e ON t.id_especialista = e.id_especialista
      INNER JOIN usuario u_esp ON e.id_usuario = u_esp.id_usuario
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      INNER JOIN estado_turno et ON t.id_estado_turno = et.id_estado_turno
      WHERE t.id_cliente = $1
      ORDER BY t.fecha_hora DESC;
    `
        const { rows } = await pool.query(query, [id_cliente])
        return rows
    },

    // 3. Nuevo método: Obtener un turno específico por su ID
    getById: async (id_turno) => {
        const query = `
      SELECT 
        t.id_turno, 
        t.fecha_hora,
        t.id_cliente,
        (u_cli.nombre || ' ' || u_cli.apellido) AS cliente_nombre,
        c.telefono AS cliente_telefono,
        t.id_especialista,
        (u_esp.nombre || ' ' || u_esp.apellido) AS especialista_nombre,
        e.especialidad,
        t.id_servicio,
        s.nombre_servicio,
        s.duracion_minutos,
        s.precio_base,
        t.id_estado_turno,
        et.nombre_estado
      FROM turno t
      INNER JOIN cliente c ON t.id_cliente = c.id_cliente
      INNER JOIN usuario u_cli ON c.id_usuario = u_cli.id_usuario
      INNER JOIN especialista e ON t.id_especialista = e.id_especialista
      INNER JOIN usuario u_esp ON e.id_usuario = u_esp.id_usuario
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      INNER JOIN estado_turno et ON t.id_estado_turno = et.id_estado_turno
      WHERE t.id_turno = $1;
    `
        const { rows } = await pool.query(query, [id_turno])
        return rows[0]
    },



    // 4. Crear un nuevo Turno
    create: async (turnoData) => {
        const { id_cliente, id_especialista, id_servicio, fecha_hora } = turnoData
        const query = `
      INSERT INTO turno (id_cliente, id_especialista, id_servicio, fecha_hora, id_estado_turno)
      VALUES ($1, $2, $3, $4, 1)
      RETURNING id_turno, id_cliente, id_especialista, id_servicio, fecha_hora, id_estado_turno; -- <-- Corregido acá (singular)
    `
        const { rows } = await pool.query(query, [id_cliente, id_especialista, id_servicio, fecha_hora])
        return rows[0]
    },
    

    // 5. Cambiar el estado del turno
    updateEstado: async (id_turno, id_estado_turno) => {
        const query = `
      UPDATE turno
      SET id_estado_turno = $2
      WHERE id_turno = $1 -- <-- Corregido acá (singular)
      RETURNING id_turno, id_estado_turno; -- <-- Corregido acá (singular)
    `
        const { rows } = await pool.query(query, [id_turno, id_estado_turno])
        return rows[0]
    },
    // Nuevo método: Reprogramar fecha y hora de un turno
    reprogramar: async (id_turno, nueva_fecha_hora) => {
        const query = `
      UPDATE turno
      SET fecha_hora = $2, id_estado_turno = 1 -- Al reprogramar, vuelve a quedar 'Pendiente'
      WHERE id_turno = $1
      RETURNING id_turno, fecha_hora, id_estado_turno;
    `
        const { rows } = await pool.query(query, [id_turno, nueva_fecha_hora])
        return rows[0]
    },

    // Ajustado para filtrar por especialista Y por una fecha específica (YYYY-MM-DD)
    // Ajustado para filtrar por ID de ESPECIALISTA (el que te dio el Login)
    getByEspecialista: async (id_especialista) => {
        const query = `
          SELECT 
            t.id_turno,
            t.fecha_hora,
            (u_cli.nombre || ' ' || u_cli.apellido) AS cliente_nombre,
            t.id_cliente,
            s.nombre_servicio, 
            s.duracion_minutos, 
            s.precio_base,
            et.nombre_estado
          FROM turno t
          INNER JOIN cliente c ON t.id_cliente = c.id_cliente
          INNER JOIN usuario u_cli ON c.id_usuario = u_cli.id_usuario
          INNER JOIN especialista e ON t.id_especialista = e.id_especialista
          INNER JOIN estado_turno et ON t.id_estado_turno = et.id_estado_turno
          INNER JOIN servicio s ON t.id_servicio = s.id_servicio
          WHERE t.id_especialista = $1
          ORDER BY t.fecha_hora ASC;
        `
        // Enviamos solo el ID. Quitamos el filtro de fecha del SQL para que el frontend (que ya lo hace) sea el que filtre.
        const { rows } = await pool.query(query, [id_especialista])
        return rows
    }, 

    // Agrega este método en tu archivo de modelo de turnos
verificarTurnosEnRango: async (id_especialista, fecha_inicio, fecha_fin) => {
    // Buscamos si existe al menos un turno en ese periodo
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM turno 
            WHERE id_especialista = $1 
            AND fecha_hora >= $2 
            AND fecha_hora < $3
        ) as existe;
    `;
    const { rows } = await pool.query(query, [id_especialista, fecha_inicio, fecha_fin]);
    return rows[0].existe;
}

}