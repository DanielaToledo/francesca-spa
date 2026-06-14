import { Router } from 'express'
import { especialistaController } from '../controllers/especialistaController.js'

const router = Router()

router.get('/', especialistaController.getEspecialistas)
router.get('/:id', especialistaController.getEspecialistaById)
router.post('/', especialistaController.createEspecialista)
router.get('/:id_especialista/configuracion', especialistaController.getConfiguracion);
router.put('/:id_especialista/configuracion', especialistaController.updateConfiguracion);


export default router