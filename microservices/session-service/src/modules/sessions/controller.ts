import { Request, Response, NextFunction } from 'express';
import * as sessionService from './service';
import { createSessionSchema, updateSessionSchema } from './validation';

export const createSessionController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
        const validated = createSessionSchema.parse(req.body); 
        const session = await sessionService.createSession(validated); 
        
        res.status(201).json(session); 
    } catch (error) {
        next(error);
    }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
        const sessions = await sessionService.listSessions(req.query.eventId as string); 

        if (!sessions || sessions.length === 0) {
            res.status(404).json({ error: 'No sessions found!' });
            return;
        }

        res.json(sessions); 
    } catch (error) {
        next(error);
    }
};

export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
        const session = await sessionService.getSessionById(req.params.id); 
        if (!session) { 
            res.status(404).json({ error: 'Session not found!' }); 
            return; 
        }

        res.json(session); 
    } catch (error) {
        next(error);
    }
};

export const updateSessionController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
        const validated = updateSessionSchema.parse(req.body); 
        const session = await sessionService.updateSession(req.params.id, validated); 

        res.json(session); 
    } catch (error) {
        next(error);
    }
};

export const deleteSessionController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { 
        await sessionService.deleteSession(req.params.id);
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
export const addSpeakerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { speakerId } = req.body;
        const result = await sessionService.addSpeakerToSession(req.params.id, speakerId);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};
export const removeSpeakerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await sessionService.removeSpeakerFromSession(req.params.id, req.params.speakerId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};