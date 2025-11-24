import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import { updateUserSchema, changePasswordSchema } from './validation';
import * as userService from './service';

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.listUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userService.getUserById(req.params.id);
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = updateUserSchema.parse(req.body);
        
        // Check permissions
        if (req.user?.userId !== req.params.id && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'You can only update your own profile' });
            return;
        }

        // Only admins can change roles
        if (validated.role && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Only admins can change user roles' });
            return;
        }
        
        const user = await userService.updateUser(req.params.id, validated);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await userService.deleteUser(req.params.id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const changeUserPassword = async (req: AuthRequest, res: Response, next: NextFunction ): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        
        const validated = changePasswordSchema.parse(req.body);
        const result = await userService.changePassword(req.user.userId, validated);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getUserSessionsController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check permissions
        if (req.user?.userId !== req.params.id && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'You can only view your own sessions' });
            return;
        }

        const eventId = req.query.eventId as string | undefined;
        const sessions = await userService.getUserSessions(req.params.id, eventId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

export const attendSessionController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { sessionId, eventId } = req.body;
        
        if (!sessionId || !eventId) {
            res.status(400).json({ error: 'sessionId and eventId are required' });
            return;
        }

        const attendance = await userService.attendSession(
            req.user.userId,
            sessionId,
            eventId
        );
        
        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};