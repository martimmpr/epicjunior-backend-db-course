import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as controller from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, controller.createEventController);
router.get('/', authMiddleware, controller.getEvents);
router.get('/:id', authMiddleware, controller.getEvent);
router.put('/:id', authMiddleware, adminMiddleware, controller.updateEventController);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteEventController);
router.post('/:id/enroll', authMiddleware, controller.enrollController);
router.delete('/:id/leave', authMiddleware, controller.leaveController);

export default router;