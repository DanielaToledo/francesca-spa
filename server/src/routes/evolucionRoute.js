import { Router } from 'express'
import { evolucionController } from '../controllers/evolucionController.js'

const router = Router()

router.get('/cliente/:id_cliente', evolucionController.getHistorialCliente) // Ver historial del cliente
router.post('/', evolucionController.createEvolucion) // Guardar nueva ficha

export default router