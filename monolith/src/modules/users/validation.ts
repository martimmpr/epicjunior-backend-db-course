import { z } from 'zod';

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters!').optional(),
    email: z.string().email('Invalid email format!').optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required!'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters!')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter!')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter!')
        .regex(/[0-9]/, 'Password must contain at least one number!'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;