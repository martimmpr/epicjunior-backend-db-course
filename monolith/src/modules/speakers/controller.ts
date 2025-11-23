import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import * as speakerService from './service';
import { createSpeakerSchema, updateSpeakerSchema } from './validation';
import { AppError } from '../../shared/middleware/errorHandler';

export const createSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const validatedData = createSpeakerSchema.parse(req.body);
        const speaker = await speakerService.createSpeaker(validatedData);
        res.status(201).json(speaker);
    } catch (error) {
        next(error);
    }
};

export const getSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const speaker = await speakerService.getSpeakerById(id);
        
        if (!speaker) {
            throw new AppError('Speaker not found', 404);
        }
        
        res.json(speaker);
    } catch (error) {
        next(error);
    }
};

export const listSpeakers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const speakers = await speakerService.listSpeakers();
        res.json(speakers);
    } catch (error) {
        next(error);
    }
};

export const updateSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateSpeakerSchema.parse(req.body);
        const speaker = await speakerService.updateSpeaker(id, validatedData);
        res.json(speaker);
    } catch (error) {
        next(error);
    }
};

export const deleteSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await speakerService.deleteSpeaker(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};