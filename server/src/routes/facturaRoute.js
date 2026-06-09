import { Router } from 'express'
import { facturaController } from '../controllers/facturaController.js'

const router = Router()

router.post('/', facturaController.emitirFactura) // Crear factura
router.get('/:id', facturaController.getFacturaDetalle) // Buscar factura por ID con todo su detalle

export default router