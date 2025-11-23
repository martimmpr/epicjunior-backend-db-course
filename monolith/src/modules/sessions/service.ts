import { PrismaClient } from '@prisma/client';
import { CreateSessionInput, UpdateSessionInput } from './validation';

const prisma = new PrismaClient();

export const createSession = async (data: CreateSessionInput) => {
    const session = await prisma.session.create({
        data: {
            ...data,
            date: new Date(data.date),
        },
        include: {
            event: true,
        },
    });

    return session;
};

export const getSessionById = async (id: string) => {
    const session = await prisma.session.findUnique({
        where: { id },
        include: {
            event: true,
            sessionSpeakers: {
                include: {
                    speaker: true,
                },
            },
            userSessions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!session || session.deleted) {
        return null;
    }

    return session;
};

export const listSessions = async (eventId?: string) => {
    const sessions = await prisma.session.findMany({
        where: {
            deleted: false,
            ...(eventId && { eventId }),
        },
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
            _count: {
                select: {
                    userSessions: true,
                },
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
    
    return sessions;
};

export const updateSession = async (id: string, data: UpdateSessionInput) => {
    const updateData: any = { ...data };
    
    if (data.date) {
        updateData.date = new Date(data.date);
    }

    const session = await prisma.session.update({
        where: { id },
        data: updateData,
        include: {
            event: true,
        },
    });

    return session;
};

export const deleteSession = async (id: string) => {
    const session = await prisma.session.update({
        where: { id },
        data: { deleted: true },
    });

    return session;
};

export const addSpeakerToSession = async (sessionId: string, speakerId: string) => {
    // Check if session and speaker exist
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    const speaker = await prisma.speaker.findUnique({ where: { id: speakerId } });

    if (!session || session.deleted) {
        throw new Error('Session not found');
    }

    if (!speaker || speaker.deleted) {
        throw new Error('Speaker not found');
    }

    // Check if already linked
    const existing = await prisma.sessionSpeaker.findUnique({
        where: {
            sessionId_speakerId: {
                sessionId,
                speakerId,
            },
        },
    });

    if (existing) {
        throw new Error('Speaker already added to this session');
    }

    const sessionSpeaker = await prisma.sessionSpeaker.create({
        data: {
            sessionId,
            speakerId,
        },
        include: {
            speaker: true,
            session: true,
        },
    });

    return sessionSpeaker;
};

export const removeSpeakerFromSession = async (sessionId: string, speakerId: string) => {
    const sessionSpeaker = await prisma.sessionSpeaker.delete({
        where: {
            sessionId_speakerId: {
                sessionId,
                speakerId,
            },
        },
    });
    return sessionSpeaker;
};

export const attendSession = async (sessionId: string, userId: string, eventId: string) => {
    // Check if already registered
    const existing = await prisma.userSession.findUnique({
        where: {
            userId_sessionId: {
                userId,
                sessionId,
            },
        },
    });

    if (existing) {
        // Update attendance
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

    // Create new attendance record
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