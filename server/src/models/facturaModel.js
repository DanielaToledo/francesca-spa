import pool from '../config/dbConfig.js'

export const FacturaModel = {
  // 1. Crear una nueva factura
  create: async (facturaData) => {
    const { id_pago, monto_final_cobrado, metodo_pago_saldo, fecha_facturacion } = facturaData
    const fecha = fecha_facturacion || new Date()

    const query = `
      INSERT INTO factura (id_pago, monto_final_cobrado, metodo_pago_saldo, fecha_facturacion)
      VALUES ($1, $2, $3, $4)
      RETURNING id_factura, id_pago, monto_final_cobrado, metodo_pago_saldo, fecha_facturacion;
    `
    const { rows } = await pool.query(query, [id_pago, monto_final_cobrado, metodo_pago_saldo, fecha])
    return rows[0]
  },

  // 2. Obtener el detalle completo de una factura por su ID (Ideal para imprimir/mostrar)
  getById: async (id_factura) => {
    const query = `
      SELECT 
        f.id_factura,
        f.monto_final_cobrado,
        f.metodo_pago_saldo,
        f.fecha_facturacion,
        p.monto_total AS pago_monto_total,
        p.monto_senado AS pago_monto_senado,
        (u_cli.nombre || ' ' || u_cli.apellido) AS cliente_nombre,
        u_cli.dni AS cliente_dni,
        s.nombre_servicio,
        t.fecha_hora AS fecha_turno
      FROM factura f
      INNER JOIN pago p ON f.id_pago = p.id_pago
      INNER JOIN turno t ON p.id_turno = t.id_turno
      INNER JOIN cliente c ON t.id_cliente = c.id_cliente
      INNER JOIN usuario u_cli ON c.id_usuario = u_cli.id_usuario
      INNER JOIN servicio s ON t.id_servicio = s.id_servicio
      WHERE f.id_factura = $1;
    `
    const { rows } = await pool.query(query, [id_factura])
    return rows[0]
  }
}