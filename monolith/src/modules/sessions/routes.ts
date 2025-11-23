import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as sessionController from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.get('/', sessionController.listSessions);
router.put('/:id', authMiddleware, adminMiddleware, sessionController.updateSession);
router.delete('/:id', authMiddleware, adminMiddleware, sessionController.deleteSession);
router.post('/:id/speakers/:speakerId', authMiddleware, adminMiddleware, sessionController.addSpeaker);
router.delete('/:id/speakers/:speakerId', authMiddleware, adminMiddleware, sessionController.removeSpeaker);
router.post('/:id/attend', authMiddleware, sessionController.attendSession);

export default router;