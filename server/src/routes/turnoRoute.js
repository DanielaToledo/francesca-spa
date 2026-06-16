import { Router } from 'express'
import { turnoController } from '../controllers/turnoController.js'

const router = Router()

// 1. Mueve las rutas más ESPECÍFICAS arriba
router.get('/agenda/resumen/:id_especialista', turnoController.getResumenAgenda);
router.get('/cliente/:id_cliente', turnoController.getTurnosCliente);
router.get('/especialista/:id_usuario', turnoController.getTurnosEspecialista);

// 2. Las rutas con parámetros genéricos al final
router.get('/:id', turnoController.getTurnoById); 

// 3. El resto de las rutas
router.get('/', turnoController.getTurnos);
router.post('/', turnoController.createTurno);
router.patch('/:id/estado', turnoController.cambiarEstado);
router.put('/:id/reprogramar', turnoController.reprogramarTurno);

export default router