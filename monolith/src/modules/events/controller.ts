import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import * as eventService from './service';
import { createEventSchema, updateEventSchema } from './validation';
import { AppError } from '../../shared/middleware/errorHandler';

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const validatedData = createEventSchema.parse(req.body);
        const event = await eventService.createEvent(validatedData);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

export const getEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const event = await eventService.getEventById(id);
        
        if (!event) {
            throw new AppError('Event not found', 404);
        }
        
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const listEvents = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const events = await eventService.listEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateEventSchema.parse(req.body);
        const event = await eventService.updateEvent(id, validatedData);
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await eventService.deleteEvent(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const enrollInEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const enrollment = await eventService.enrollInEvent(id, userId);
        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const leaveEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        await eventService.leaveEvent(id, userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};