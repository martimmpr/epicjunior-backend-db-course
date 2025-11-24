import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as controller from './controller';

const router = Router();

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, controller.getUsers);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteUser);

// Authenticated user routes
router.get('/:id', authMiddleware, controller.getUser);
router.put('/:id', authMiddleware, controller.updateUser);
router.post('/change-password', authMiddleware, controller.changeUserPassword);
router.get('/:id/sessions', authMiddleware, controller.getUserSessionsController);
router.post('/attend-session', authMiddleware, controller.attendSessionController);

export default router;
