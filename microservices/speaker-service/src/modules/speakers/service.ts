import { PrismaClient } from '@prisma/client';
import { CreateSpeakerInput, UpdateSpeakerInput } from './validation';

const prisma = new PrismaClient();

export const createSpeaker = async (data: CreateSpeakerInput) => {
    return await prisma.speaker.create({ data });
};

export const getSpeakerById = async (id: string) => {
    const speaker = await prisma.speaker.findUnique({ 
        where: { id } 
    });

    if (!speaker || speaker.deleted) return null;

    return speaker;
};

export const listSpeakers = async () => {
    return await prisma.speaker.findMany({ 
        where: { deleted: false }, 
        orderBy: { name: 'asc' } 
    });
};

export const updateSpeaker = async (id: string, data: UpdateSpeakerInput) => {
    return await prisma.speaker.update({ 
        where: { id }, 
        data 
    });
};

export const deleteSpeaker = async (id: string) => {
    return await prisma.speaker.update({ 
        where: { id }, 
        data: { deleted: true } 
    });
};