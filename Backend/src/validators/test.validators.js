import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const classLevelEnum = z.enum(['6', '7', '8', '9', '10']);
const subjectEnum = z.enum(['Math', 'Science']);
const statusEnum = z.enum(['draft', 'published']);

const requiredTestFields = {
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  classLevel: classLevelEnum,
  subject: subjectEnum,
  chapter: z.string().trim().max(120).optional().or(z.literal('')),
  questions: z
    .array(z.string().regex(objectIdRegex, 'Invalid question id'))
    .min(1, 'At least one question is required'),
  duration: z.number().int().min(1),
  totalMarks: z.number().int().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: statusEnum.optional(),
};

export const createTestSchema = z
  .object(requiredTestFields)
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be greater than startTime',
    path: ['endTime'],
  });

export const updateTestSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    classLevel: classLevelEnum.optional(),
    subject: subjectEnum.optional(),
    chapter: z.string().trim().max(120).optional(),
    questions: z
      .array(z.string().regex(objectIdRegex, 'Invalid question id'))
      .min(1, 'At least one question is required')
      .optional(),
    duration: z.number().int().min(1).optional(),
    totalMarks: z.number().int().min(1).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: statusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  })
  .refine(
    (data) =>
      !data.startTime ||
      !data.endTime ||
      (data.startTime instanceof Date && data.endTime instanceof Date && data.endTime > data.startTime),
    {
      message: 'endTime must be greater than startTime when both are provided',
      path: ['endTime'],
    }
  );

export const mongoIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid id format'),
});

