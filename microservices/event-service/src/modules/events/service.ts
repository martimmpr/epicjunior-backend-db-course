import { PrismaClient } from '@prisma/client';
import { CreateEventInput, UpdateEventInput } from './validation';

const prisma = new PrismaClient();

export const createEvent = async (data: CreateEventInput) => {
    return await prisma.event.create({ data: { ...data, date: new Date(data.date) } });
};

export const getEventById = async (id: string) => {
    const event = await prisma.event.findUnique({ where: { id }, include: { eventSessions: true, userEvents: true } });
    if (!event || event.deleted) return null;
    return event;
};

export const listEvents = async () => {
    return await prisma.event.findMany({ where: { deleted: false }, orderBy: { date: 'asc' } });
};

export const updateEvent = async (id: string, data: UpdateEventInput) => {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    return await prisma.event.update({ where: { id }, data: updateData });
};

export const deleteEvent = async (id: string) => {
    return await prisma.event.update({ where: { id }, data: { deleted: true } });
};

export const enrollInEvent = async (eventId: string, userId: string) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.deleted) throw new Error('Event not found');
    const existing = await prisma.userEvent.findUnique({ where: { userId_eventId: { userId, eventId } } });
    if (existing) throw new Error('Already enrolled');
    return await prisma.userEvent.create({ data: { userId, eventId } });
};

export const leaveEvent = async (eventId: string, userId: string) => {
    return await prisma.userEvent.delete({ where: { userId_eventId: { userId, eventId } } });
};