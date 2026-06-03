import { Router } from 'express'
import { especialistaController } from '../controllers/especialistaController.js'

const router = Router()

router.get('/', especialistaController.getEspecialistas)
router.get('/:id', especialistaController.getEspecialistaById)
router.post('/', especialistaController.createEspecialista)

export default router