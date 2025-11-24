import { Router } from 'express';
import { register, login, me } from './controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;