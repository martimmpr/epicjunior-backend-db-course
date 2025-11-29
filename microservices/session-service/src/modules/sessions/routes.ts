import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as controller from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, controller.createSessionController);
router.get('/', authMiddleware, controller.getSessions);
router.get('/:id', authMiddleware, controller.getSession);
router.put('/:id', authMiddleware, adminMiddleware, controller.updateSessionController);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteSessionController);
router.post('/:id/speakers', authMiddleware, adminMiddleware, controller.addSpeakerController);
router.delete('/:id/speakers/:speakerId', authMiddleware, adminMiddleware, controller.removeSpeakerController);

export default router;