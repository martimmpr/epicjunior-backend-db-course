import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as eventController from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, eventController.createEvent);
router.get('/:id', authMiddleware, eventController.getEvent);
router.get('/', authMiddleware, eventController.listEvents);
router.put('/:id', authMiddleware, adminMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, adminMiddleware, eventController.deleteEvent);
router.post('/:id/enroll', authMiddleware, eventController.enrollInEvent);
router.delete('/:id/leave', authMiddleware, eventController.leaveEvent);

export default router;