import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../shared/middleware/errorHandler';
import { generateTokens, TokenPayload } from '../../shared/utils/jwt';
import { RegisterInput, LoginInput } from './validation';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

export class AuthService {
    async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const tokens = generateTokens(tokenPayload);

        return {
            user,
            ...tokens,
        };
    }

    async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        if (user.deleted) {
            throw new AppError('Account has been deleted', 403);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const tokens = generateTokens(tokenPayload);

        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                deleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.deleted) {
            throw new AppError('Account has been deleted', 403);
        }

        const { deleted, ...userWithoutDeleted } = user;
        return userWithoutDeleted;
    }
}