import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import * as userService from './service';
import { updateUserSchema, changePasswordSchema } from './validation';
import { AppError } from '../../shared/middleware/errorHandler';

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        
        if (!user) {
            throw new AppError('User not found!', 404);
        }
        
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const users = await userService.listUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateUserSchema.parse(req.body);
        
        // Only allow users to update themselves, unless they're admin
        const requestingUser = req.user!;
        if (requestingUser.userId !== id && requestingUser.role !== 'ADMIN') {
            throw new AppError('You can only update your own profile!', 403);
        }
        
        // Only admins can change roles
        if (validatedData.role && requestingUser.role !== 'ADMIN') {
            throw new AppError('Only admins can change user roles!', 403);
        }
        
        const user = await userService.updateUser(id, validatedData);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const validatedData = changePasswordSchema.parse(req.body);
        const result = await userService.changePassword(userId, validatedData);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getUserEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        // Only allow users to see their own events, unless they're admin
        const requestingUser = req.user!;
        if (requestingUser.userId !== id && requestingUser.role !== 'ADMIN') {
            throw new AppError('You can only view your own events', 403);
        }
        
        const events = await userService.getUserEvents(id);
        res.json(events);
    } catch (error) {
        next(error);
    }
};

export const getUserSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const eventId = req.query.eventId as string | undefined;
        
        // Only allow users to see their own sessions, unless they're admin
        const requestingUser = req.user!;
        if (requestingUser.userId !== id && requestingUser.role !== 'ADMIN') {
            throw new AppError('You can only view your own sessions', 403);
        }
        
        const sessions = await userService.getUserSessions(id, eventId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};