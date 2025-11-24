import { z } from 'zod';

export const createSessionSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['WORKSHOP', 'TALK', 'PANEL', 'NETWORKING']),
    local: z.string().min(1),
    date: z.string(),
    duration: z.number().min(1),
    time: z.string(),
    eventId: z.string(),
    mandatory: z.boolean().optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;