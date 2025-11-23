import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as userController from './controller';

const router = Router();

router.get('/:id', authMiddleware, userController.getUser);
router.get('/', authMiddleware, adminMiddleware, userController.listUsers);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);
router.post('/change-password', authMiddleware, userController.changePassword);
router.get('/:id/events', authMiddleware, userController.getUserEvents);
router.get('/:id/sessions', authMiddleware, userController.getUserSessions);

export default router;