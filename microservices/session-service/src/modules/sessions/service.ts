import { PrismaClient } from '@prisma/client';
import { CreateSessionInput, UpdateSessionInput } from './validation';

const prisma = new PrismaClient();

export const createSession = async (data: CreateSessionInput) => {
    return await prisma.session.create({ 
        data: { 
            ...data, 
            date: new Date(data.date) 
        } 
    });
};

export const getSessionById = async (id: string) => {
    const session = await prisma.session.findUnique({ 
        where: { id }, 
        include: { sessionSpeakers: true } 
    });

    if (!session || session.deleted) return null;

    return session;
};

export const listSessions = async (eventId?: string) => {
    return await prisma.session.findMany({ 
        where: { 
            deleted: false, 
            ...(eventId && { eventId }) 
        }, 
        orderBy: { date: 'asc' } 
    });
};

export const updateSession = async (id: string, data: UpdateSessionInput) => {
    const updateData: any = { ...data };

    if (data.date) {
        updateData.date = new Date(data.date);
    }

    return await prisma.session.update({ 
        where: { id }, 
        data: updateData 
    });
};

export const deleteSession = async (id: string) => {
    return await prisma.session.update({ 
        where: { id }, 
        data: { deleted: true } 
    });
};

export const addSpeakerToSession = async (sessionId: string, speakerId: string) => {
    const session = await prisma.session.findUnique({ 
        where: { id: sessionId } 
    });

    if (!session || session.deleted) {
        throw new Error('Session not found');
    }

    const existing = await prisma.sessionSpeaker.findUnique({ 
        where: { 
            sessionId_speakerId: { sessionId, speakerId } 
        } 
    });

    if (existing) {
        throw new Error('Speaker already added');
    }

    return await prisma.sessionSpeaker.create({ 
        data: { sessionId, speakerId } 
    });
};

export const removeSpeakerFromSession = async (sessionId: string, speakerId: string) => {
    return await prisma.sessionSpeaker.delete({ 
        where: { 
            sessionId_speakerId: { sessionId, speakerId } 
        } 
    });
};