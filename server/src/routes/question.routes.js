const express = require('express');
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Routes mapped to controllers
// Admin-only routes are protected with both 'protect' and 'isAdmin'
// Read-only routes (GET) are just protected for now so approved students can potentially read them

router.post('/', protect, isAdmin, createQuestion);
router.get('/', protect, getAllQuestions);
router.get('/:id', protect, getQuestionById);
router.patch('/:id', protect, isAdmin, updateQuestion);
router.delete('/:id', protect, isAdmin, deleteQuestion);

module.exports = router;