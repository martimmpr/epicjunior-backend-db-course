import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UpdateUserInput, ChangePasswordInput } from './validation';

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
            userEvents: {
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            date: true,
                            organization: true,
                        },
                    },
                },
            },
            userSessions: {
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            date: true,
                        },
                    },
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
    // Get user with password
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || user.deleted) {
        throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
};

export const getUserEvents = async (userId: string) => {
    const userEvents = await prisma.userEvent.findMany({
        where: {
            userId,
        },
        include: {
            event: {
                select: {
                    id: true,
                    name: true,
                    organization: true,
                    date: true,
                    description: true,
                    logo: true,
                },
            },
        },
        orderBy: {
            event: {
                date: 'desc',
            },
        },
    });

    return userEvents;
};

export const getUserSessions = async (userId: string, eventId?: string) => {
    const userSessions = await prisma.userSession.findMany({
        where: {
            userId,
            ...(eventId && { eventId }),
        },
        include: {
            session: {
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            date: true,
                        },
                    },
                    sessionSpeakers: {
                        include: {
                            speaker: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            session: {
                date: 'desc',
            },
        },
    });

    return userSessions;
};