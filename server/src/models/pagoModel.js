import pool from '../config/dbConfig.js'

export const PagoModel = {
  // 1. Registrar un nuevo pago (Seña o Total)
  create: async (pagoData) => {
    const { id_turno, monto_total, monto_senado, id_estado_pago, fecha_pago_seña } = pagoData
    
    // Si no viene fecha, usamos la fecha y hora actual del servidor
    const fechaSeña = fecha_pago_seña || new Date()

    const query = `
      INSERT INTO pago (id_turno, monto_total, monto_senado, id_estado_pago, fecha_pago_seña)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_pago, id_turno, monto_total, monto_senado, id_estado_pago, fecha_pago_seña;
    `
    const { rows } = await pool.query(query, [id_turno, monto_total, monto_senado, id_estado_pago, fechaSeña])
    return rows[0]
  },

  // 2. Obtener el pago asociado a un Turno específico (Con nombres de cliente y servicio)
  getByTurno: async (id_turno) => {
    const query = `
      SELECT 
        p.id_pago,
        p.id_turno,
        p.monto_total,
        p.monto_senado,
        p.id_estado_pago,
        p.fecha_pago_seña,
        (u_cli.nombre || ' ' || u_cli.apellido) AS cliente_nombre,
        s.nombre_servicio,
        s.precio_base
      FROM pago p
      INNER JOIN turno t ON p.id_turno = t.id_turno
      INNER JOIN cliente c ON t.id_cliente = c.id_cliente
      INNER JOIN usuario u_cli ON c.id_usuario = u_cli.id_usuario
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      WHERE p.id_turno = $1;
    `
    const { rows } = await pool.query(query, [id_turno])
    return rows[0]
  },

  // 3. Actualizar el pago (Ideal para cuando completan el saldo o cambia el estado)
  update: async (id_pago, updateData) => {
    const { monto_senado, id_estado_pago } = updateData
    const query = `
      UPDATE pago
      SET monto_senado = $2, id_estado_pago = $3
      WHERE id_pago = $1
      RETURNING id_pago, id_turno, monto_total, monto_senado, id_estado_pago;
    `
    const { rows } = await pool.query(query, [id_pago, monto_senado, id_estado_pago])
    return rows[0]
  }
}