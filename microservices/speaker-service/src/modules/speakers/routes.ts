import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as controller from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, controller.createSpeakerController);
router.get('/', authMiddleware, controller.getSpeakers);
router.get('/:id', authMiddleware, controller.getSpeaker);
router.put('/:id', authMiddleware, adminMiddleware, controller.updateSpeakerController);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteSpeakerController);

export default router;