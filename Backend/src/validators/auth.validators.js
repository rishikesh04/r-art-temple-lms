import { z } from 'zod';

const classLevelEnum = z.enum(['6', '7', '8', '9', '10']);

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Valid email is required').trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone must be a 10-digit number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  classLevel: classLevelEnum,
});

export const loginSchema = z.object({
  email: z.email('Valid email is required').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

