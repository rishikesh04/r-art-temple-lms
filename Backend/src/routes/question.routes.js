import express from 'express';
import {
  createQuestion,
  bulkCreateQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import {
  bulkCreateQuestionsSchema,
  createQuestionSchema,
  questionIdParamSchema,
  updateQuestionSchema,
} from '../validators/question.validators.js';

const router = express.Router();

// Routes mapped to controllers
// Admin-only routes are protected with both 'protect' and 'isAdmin'
// Read-only routes (GET) are just protected for now so approved students can potentially read them

router.post('/', protect, isAdmin, validateBody(createQuestionSchema), createQuestion);
router.post('/bulk', protect, isAdmin, validateBody(bulkCreateQuestionsSchema), bulkCreateQuestions);
router.get('/', protect, getAllQuestions);
router.get('/:id', protect, validateParams(questionIdParamSchema), getQuestionById);
router.patch('/:id', protect, isAdmin, validateParams(questionIdParamSchema), validateBody(updateQuestionSchema), updateQuestion);
router.delete('/:id', protect, isAdmin, validateParams(questionIdParamSchema), deleteQuestion);

export default router;