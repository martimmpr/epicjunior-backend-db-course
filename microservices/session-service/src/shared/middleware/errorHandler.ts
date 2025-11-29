import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: Error | AppError | ZodError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
        
        return;
    }

    // Custom application errors
    if (err instanceof AppError && err.isOperational) {
        res.status(err.statusCode).json({
            error: err.message,
        });

        return;
    }

    // Default to 500 server error
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    });
};