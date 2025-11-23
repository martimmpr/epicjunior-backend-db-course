import { PrismaClient } from '@prisma/client';
import { CreateEventInput, UpdateEventInput } from './validation';

const prisma = new PrismaClient();

export const createEvent = async (data: CreateEventInput) => {
    const event = await prisma.event.create({
        data: {
            ...data,
            date: new Date(data.date),
        },
    });

    return event;
};

export const getEventById = async (id: string) => {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            sessions: {
                where: { deleted: false },
                include: {
                    sessionSpeakers: {
                        include: {
                            speaker: true,
                        },
                    },
                },
            },
            userEvents: {
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

    if (!event || event.deleted) {
        return null;
    }

    return event;
};

export const listEvents = async () => {
    const events = await prisma.event.findMany({
        where: {
            deleted: false,
        },
        include: {
            _count: {
                select: {
                    userEvents: true,
                    sessions: true,
                },
            },
        },
        orderBy: {
            date: 'asc',
        },
    });

    return events;
};

export const updateEvent = async (id: string, data: UpdateEventInput) => {
    const updateData: any = { ...data };
    
    if (data.date) {
        updateData.date = new Date(data.date);
    }

    const event = await prisma.event.update({
        where: { id },
        data: updateData,
    });

    return event;
};

export const deleteEvent = async (id: string) => {
    const event = await prisma.event.update({
        where: { id },
        data: { deleted: true },
    });
    return event;
};

export const enrollInEvent = async (eventId: string, userId: string) => {
    // Check if event exists
    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event || event.deleted) {
        throw new Error('Event not found');
    }

    // Check if already enrolled
    const existing = await prisma.userEvent.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId,
            },
        },
    });

    if (existing) {
        throw new Error('Already enrolled in this event');
    }

    const enrollment = await prisma.userEvent.create({
        data: {
            userId,
            eventId,
        },
    });

    return enrollment;
};

export const leaveEvent = async (eventId: string, userId: string) => {
    const enrollment = await prisma.userEvent.delete({
        where: {
            userId_eventId: {
                userId,
                eventId,
            },
        },
    });
    
    return enrollment;
};