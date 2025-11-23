import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import * as sessionService from './service';
import { createSessionSchema, updateSessionSchema } from './validation';
import { AppError } from '../../shared/middleware/errorHandler';

export const createSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const validatedData = createSessionSchema.parse(req.body);
        const session = await sessionService.createSession(validatedData);
        res.status(201).json(session);
    } catch (error) {
        next(error);
    }
};

export const getSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const session = await sessionService.getSessionById(id);
        
        if (!session) {
            throw new AppError('Session not found', 404);
        }
        
        res.json(session);
    } catch (error) {
        next(error);
    }
};

export const listSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const eventId = req.query.eventId as string | undefined;
        const sessions = await sessionService.listSessions(eventId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

export const updateSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateSessionSchema.parse(req.body);
        const session = await sessionService.updateSession(id, validatedData);
        res.json(session);
    } catch (error) {
        next(error);
    }
};

export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await sessionService.deleteSession(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const addSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id, speakerId } = req.params;
        const sessionSpeaker = await sessionService.addSpeakerToSession(id, speakerId);
        res.status(201).json(sessionSpeaker);
    } catch (error) {
        next(error);
    }
};

export const removeSpeaker = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id, speakerId } = req.params;
        await sessionService.removeSpeakerFromSession(id, speakerId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const attendSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { eventId } = req.body;
        const userId = req.user!.userId;
        
        if (!eventId) {
            throw new AppError('eventId is required', 400);
        }
        
        const attendance = await sessionService.attendSession(id, userId, eventId);
        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};