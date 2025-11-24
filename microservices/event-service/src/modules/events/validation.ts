import { z } from 'zod';

export const createEventSchema = z.object({
    name: z.string().min(1),
    organization: z.string().min(1),
    date: z.string(),
    description: z.string().min(1),
    logo: z.string().optional(),
});

export const updateEventSchema = z.object({
    name: z.string().min(1).optional(),
    organization: z.string().min(1).optional(),
    date: z.string().optional(),
    description: z.string().min(1).optional(),
    logo: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;