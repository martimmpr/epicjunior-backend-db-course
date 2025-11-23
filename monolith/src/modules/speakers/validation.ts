import { z } from 'zod';

export const createSpeakerSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters!'),
    avatar: z.string().url().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters!'),
});

export const updateSpeakerSchema = z.object({
    name: z.string().min(3).optional(),
    avatar: z.string().url().optional(),
    description: z.string().min(10).optional(),
});

export type CreateSpeakerInput = z.infer<typeof createSpeakerSchema>;
export type UpdateSpeakerInput = z.infer<typeof updateSpeakerSchema>;