import { Router } from 'express'
import { rolController } from '../controllers/rolController.js'

const router = Router()

router.get('/', rolController.getRoles) // GET /api/roles

export default router