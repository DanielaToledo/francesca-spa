import { Router } from 'express'
import { pagoController } from '../controllers/pagoController.js'

const router = Router()

router.post('/', pagoController.registrarPago) // Registrar seña o pago total
router.get('/turno/:id_turno', pagoController.getPagoPorTurno) // Ver el estado financiero de un turno
router.put('/:id', pagoController.actualizarPago) // Modificar montos o estados de pago

export default router