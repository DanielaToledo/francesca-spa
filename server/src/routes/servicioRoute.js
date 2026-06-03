import { Router } from 'express'
import { servicioController } from '../controllers/servicioController.js'

const router = Router()

router.get('/', servicioController.getServicios)
router.get('/:id', servicioController.getServicioById)
router.post('/', servicioController.createServicio)
router.put('/:id', servicioController.updateServicio)
router.delete('/:id', servicioController.deleteServicio)

export default router