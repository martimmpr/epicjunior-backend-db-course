import { Request, Response, NextFunction } from 'express';
import * as speakerService from './service';
import { createSpeakerSchema, updateSpeakerSchema } from './validation';

export const createSpeakerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = createSpeakerSchema.parse(req.body);
        const speaker = await speakerService.createSpeaker(validated);

        res.status(201).json(speaker);
    } catch (error) {
        next(error);
    }
};

export const getSpeakers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const speakers = await speakerService.listSpeakers();

        res.json(speakers);
    } catch (error) {
        next(error);
    }
};

export const getSpeaker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const speaker = await speakerService.getSpeakerById(req.params.id);
        
        if (!speaker) {
            res.status(404).json({ error: 'Speaker not found' });
            return;
        }
        
        res.json(speaker);
    } catch (error) {
        next(error);
    }
};

export const updateSpeakerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = updateSpeakerSchema.parse(req.body);
        const speaker = await speakerService.updateSpeaker(req.params.id, validated);

        res.json(speaker);
    } catch (error) {
        next(error);
    }
};

export const deleteSpeakerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await speakerService.deleteSpeaker(req.params.id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};