import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import * as eventService from './service';
import { createEventSchema, updateEventSchema } from './validation';

export const createEventController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = createEventSchema.parse(req.body);
        const event = await eventService.createEvent(validated);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

export const getEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const events = await eventService.listEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const event = await eventService.getEventById(req.params.id);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const updateEventController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = updateEventSchema.parse(req.body);
        const event = await eventService.updateEvent(req.params.id, validated);
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const deleteEventController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await eventService.deleteEvent(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const enrollController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const enrollment = await eventService.enrollInEvent(req.params.id, req.user.userId);
        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const leaveController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        await eventService.leaveEvent(req.params.id, req.user.userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};