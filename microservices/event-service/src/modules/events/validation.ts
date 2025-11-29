import { z } from 'zod';

export const createEventSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters!'),
    organization: z.string().min(3, 'Organization must be at least 3 characters!'),
    date: z.string().datetime('Invalid datetime format!'),
    logo: z.string().url().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters!'),
});

export const updateEventSchema = z.object({
    name: z.string().min(3).optional(),
    organization: z.string().min(3).optional(),
    date: z.string().datetime().optional(),
    logo: z.string().url().optional(),
    description: z.string().min(10).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;