import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/authMiddleware';
import * as speakerController from './controller';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, speakerController.createSpeaker);
router.get('/:id', speakerController.getSpeaker);
router.get('/', speakerController.listSpeakers);
router.put('/:id', authMiddleware, adminMiddleware, speakerController.updateSpeaker);
router.delete('/:id', authMiddleware, adminMiddleware, speakerController.deleteSpeaker);

export default router;