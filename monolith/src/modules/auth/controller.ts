import { Response, NextFunction } from 'express';
import { AuthService } from './service';
import { registerSchema, loginSchema } from './validation';
import { AuthRequest } from '../../shared/middleware/authMiddleware';
import { logger } from '../../shared/utils/logger';

const authService = new AuthService();

export class AuthController {
    async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Validate input
            const data = registerSchema.parse(req.body);

            // Register user
            const result = await authService.register(data);

            logger.info(`New user registered: ${result.user.email}`);

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Validate input
            const data = loginSchema.parse(req.body);

            // Login user
            const result = await authService.login(data);

            logger.info(`User logged in: ${result.user.email}`);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated!' });
                return;
            }

            const user = await authService.getMe(req.user.userId);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}