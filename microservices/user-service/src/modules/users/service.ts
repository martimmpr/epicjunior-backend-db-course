import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UpdateUserInput, ChangePasswordInput } from './validation';
import { AppError } from '../../shared/middleware/errorHandler';

const prisma = new PrismaClient();

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            userSessions: {
                select: {
                    id: true,
                    sessionId: true,
                    eventId: true,
                    attended: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!user || (user as any).deleted) {
        return null;
    }

    return user;
};

export const listUsers = async () => {
    const users = await prisma.user.findMany({
        where: {
            deleted: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return users;
};

export const updateUser = async (id: string, data: UpdateUserInput) => {
    const user = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};

export const deleteUser = async (id: string) => {
    const user = await prisma.user.update({
        where: { id },
        data: { deleted: true },
    });
    return user;
};

export const changePassword = async (userId: string, data: ChangePasswordInput) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || user.deleted) {
        throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
};

export const getUserSessions = async (userId: string, eventId?: string) => {
    const userSessions = await prisma.userSession.findMany({
        where: {
            userId,
            ...(eventId && { eventId }),
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return userSessions;
};

export const attendSession = async (userId: string, sessionId: string, eventId: string) => {
    const existing = await prisma.userSession.findUnique({
        where: {
            userId_sessionId: {
                userId,
                sessionId,
            },
        },
    });

    if (existing) {
        const updated = await prisma.userSession.update({
            where: {
                userId_sessionId: {
                    userId,
                    sessionId,
                },
            },
            data: {
                attended: true,
            },
        });
        return updated;
    }

    const attendance = await prisma.userSession.create({
        data: {
            userId,
            sessionId,
            eventId,
            attended: true,
        },
    });

    return attendance;
};
