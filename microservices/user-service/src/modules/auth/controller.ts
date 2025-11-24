import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { registerSchema, loginSchema } from './validation';
import { AuthRequest } from '../../shared/middleware/authMiddleware';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = registerSchema.parse(req.body);
        const result = await authService.register(validated);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validated = loginSchema.parse(req.body);
        const result = await authService.login(validated);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        
        const user = await authService.getMe(req.user.userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};