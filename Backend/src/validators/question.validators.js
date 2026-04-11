import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const classLevelEnum = z.enum(['6', '7', '8', '9', '10']);
const subjectEnum = z.enum(['Math', 'Science']);
const difficultyEnum = z.enum(['easy', 'medium', 'hard']);

const questionShape = {
  questionText: z.string().trim().min(5).max(1000),
  options: z
    .array(z.string().trim().min(1))
    .length(4, 'Exactly 4 options are required'),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(2000).optional().or(z.literal('')),
  classLevel: classLevelEnum,
  subject: subjectEnum,
  chapter: z.string().trim().min(1).max(120),
  difficulty: difficultyEnum.optional(),
};

export const createQuestionSchema = z.object(questionShape);

export const updateQuestionSchema = z
  .object({
    questionText: questionShape.questionText.optional(),
    options: questionShape.options.optional(),
    correctAnswer: questionShape.correctAnswer.optional(),
    explanation: questionShape.explanation.optional(),
    classLevel: questionShape.classLevel.optional(),
    subject: questionShape.subject.optional(),
    chapter: questionShape.chapter.optional(),
    difficulty: difficultyEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

export const bulkCreateQuestionsSchema = z.object({
  questions: z.array(createQuestionSchema).min(1).max(1000),
});

export const questionIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid question id'),
});

