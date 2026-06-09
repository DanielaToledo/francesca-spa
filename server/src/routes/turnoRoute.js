import { Router } from 'express'
import { turnoController } from '../controllers/turnoController.js'

const router = Router()

router.get('/', turnoController.getTurnos) // Agenda general
router.get('/cliente/:id_cliente', turnoController.getTurnosCliente) // Turnos de un solo cliente
router.post('/', turnoController.createTurno) // Agendar nuevo turno
router.patch('/:id/estado', turnoController.cambiarEstado) // Cambiar estado a Realizado/Cancelado
router.get('/:id', turnoController.getTurnoById) // <-- Nueva línea para buscar por ID

export default router