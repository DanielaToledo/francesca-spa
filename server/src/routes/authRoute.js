import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js' // Importa el middleware

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
// AGREGA ESTA LÍNEA:
// Cuando el front llame a /api/auth/validate, el middleware verifica el token
router.get('/validate', authMiddleware, (req, res) => {
    res.status(200).json({ success: true, message: 'Token válido' });
});

export default router