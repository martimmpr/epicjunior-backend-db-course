import { z } from 'zod';

export const createSpeakerSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    avatar: z.string().optional(),
});

export const updateSpeakerSchema = createSpeakerSchema.partial();

export type CreateSpeakerInput = z.infer<typeof createSpeakerSchema>;
export type UpdateSpeakerInput = z.infer<typeof updateSpeakerSchema>;