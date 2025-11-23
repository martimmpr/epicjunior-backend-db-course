import { PrismaClient } from '@prisma/client';
import { CreateSpeakerInput, UpdateSpeakerInput } from './validation';

const prisma = new PrismaClient();

export const createSpeaker = async (data: CreateSpeakerInput) => {
    const speaker = await prisma.speaker.create({
        data,
    });

    return speaker;
};

export const getSpeakerById = async (id: string) => {
    const speaker = await prisma.speaker.findUnique({
        where: { id },
        include: {
            sessionSpeakers: {
                include: {
                    session: {
                        include: {
                            event: true,
                        },
                    },
                },
            },
        },
    });

    if (!speaker || speaker.deleted) {
        return null;
    }

    return speaker;
};

export const listSpeakers = async () => {
    const speakers = await prisma.speaker.findMany({
        where: {
            deleted: false,
        },
        include: {
            sessionSpeakers: {
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
                        },
                    },
                },
            },
            _count: {
                select: {
                    sessionSpeakers: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    return speakers;
};

export const updateSpeaker = async (id: string, data: UpdateSpeakerInput) => {
    const speaker = await prisma.speaker.update({
        where: { id },
        data,
    });

    return speaker;
};

export const deleteSpeaker = async (id: string) => {
    const speaker = await prisma.speaker.update({
        where: { id },
        data: { deleted: true },
    });
    
    return speaker;
};