import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().regex(objectIdRegex, 'Invalid question id'),
        selectedAnswer: z.union([z.number().int().min(0).max(3), z.null()]),
      })
    )
    .max(500, 'Too many answers submitted'),
  timeTaken: z.number().int().min(0).max(60 * 60 * 8),
});

export const testIdParamSchema = z.object({
  testId: z.string().regex(objectIdRegex, 'Invalid test id'),
});

