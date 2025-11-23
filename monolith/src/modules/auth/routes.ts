import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', authMiddleware, authController.getMe.bind(authController));

export default router;