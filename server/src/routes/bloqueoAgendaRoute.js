import express from 'express';
import { BloqueoAgendaController } from '../controllers/bloqueoAgendaController.js';

const router = express.Router();

router.post('/', BloqueoAgendaController.registrarBloqueo);
router.get('/:id_especialista', BloqueoAgendaController.obtenerBloqueos);
router.delete('/:id_bloqueo', BloqueoAgendaController.eliminarBloqueo);

export default router;