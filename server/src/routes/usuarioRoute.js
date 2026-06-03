import { Router } from 'express'
import { usuarioController } from '../controllers/usuarioController.js'

const router = Router()

// 1. Las rutas con subcaminos específicos o Queries van ARRIBA
router.get('/', usuarioController.getUsuarios)
router.get('/buscar', usuarioController.searchUsuarios)       // GET /api/usuarios/buscar?nombre=...
router.get('/filtrar', usuarioController.getUsuariosByRol)   // GET /api/usuarios/filtrar?id_rol=...

// 2. Las rutas con parámetros dinámicos (/:id) van ABAJO de todo
router.get('/:id', usuarioController.getUsuarioById)
router.post('/', usuarioController.createUsuario)
router.put('/:id', usuarioController.updateUsuario)
router.delete('/:id', usuarioController.deleteUsuario)

export default router