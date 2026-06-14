import  pool  from '../config/dbConfig.js';

export const BloqueoAgendaModel = {
    // 1. Verificar si hay turnos en un rango de fecha/hora
    verificarTurnosEnRango: async (id_especialista, fecha_inicio, fecha_fin) => {
        const query = `
            SELECT COUNT(*) 
            FROM turno 
            WHERE id_especialista = $1 
            AND fecha_hora >= $2 AND fecha_hora <= $3
            AND id_estado_turno != 3; -- Asumiendo que 3 es 'Cancelado'
        `;
        const { rows } = await pool.query(query, [id_especialista, fecha_inicio, fecha_fin]);
        return parseInt(rows[0].count) > 0;
    },

    // 2. Crear el bloqueo
    crearBloqueo: async (data) => {
        const { id_especialista, fecha_inicio, fecha_fin, motivo } = data;
        const query = `
            INSERT INTO bloqueo_agenda (id_especialista, fecha_inicio, fecha_fin, motivo)
            VALUES ($1, $2, $3, $4)
            RETURNING id_bloqueo;
        `;
        const { rows } = await pool.query(query, [id_especialista, fecha_inicio, fecha_fin, motivo]);
        return rows[0];
    },

    // 3. Obtener bloqueos de un especialista para pintarlos en el calendario
    getBloqueos: async (id_especialista) => {
        const query = `SELECT * FROM bloqueo_agenda WHERE id_especialista = $1`;
        const { rows } = await pool.query(query, [id_especialista]);
        return rows;
    },

    // 4. Eliminar un bloqueo por su ID
    eliminarBloqueo: async (id_bloqueo) => {
    const query = `DELETE FROM bloqueo_agenda WHERE id_bloqueo = $1`;
    await pool.query(query, [id_bloqueo]);
}
};