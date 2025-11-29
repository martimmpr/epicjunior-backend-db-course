import { z } from 'zod';

export const createSessionSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    type: z.enum(['WORKSHOP', 'TALK', 'PANEL', 'NETWORKING']),
    local: z.string().min(2, 'Local must be at least 2 characters'),
    date: z.string().datetime('Invalid datetime format'),
    duration: z.number().int().positive('Duration must be a positive number'),
    mandatory: z.boolean().optional().default(false),
    eventId: z.string().uuid('Invalid event ID'),
});

export const updateSessionSchema = z.object({
    name: z.string().min(3).optional(),
    type: z.enum(['WORKSHOP', 'TALK', 'PANEL', 'NETWORKING']).optional(),
    local: z.string().min(2).optional(),
    date: z.string().datetime().optional(),
    duration: z.number().int().positive().optional(),
    mandatory: z.boolean().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;