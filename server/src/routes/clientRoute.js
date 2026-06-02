import { Router } from 'express'
import { clientController } from '../controllers/clientController.js'

const router = Router()


// Rutas para /api/clientes
router.get('/', clientController.getClients)         // Obtener todos
router.get('/buscar', clientController.searchClients) // GET /api/clientes/buscar?nombre=Daniela es un requests con query params
router.get('/:id', clientController.getClientById)    // GET /api/clientes/3 es un request con route params
router.post('/', clientController.createClient)       // Crear uno nuevo
router.put('/:id', clientController.updateClient)     // Actualizar por ID
router.delete('/:id', clientController.deleteClient)  // Dar de baja lógica por ID

export default router