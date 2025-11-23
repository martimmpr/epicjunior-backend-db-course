import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'monolith-backend';
const JWT_ACCESS_EXPIRATION: string = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION || '7d';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: JWT_ACCESS_EXPIRATION as any,
    };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: JWT_REFRESH_EXPIRATION as any,
    };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        logger.error('Token verification failed:', error);
        return null;
    }
};

export const generateTokens = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};