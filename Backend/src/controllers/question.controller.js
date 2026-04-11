import Question from '../models/question.model.js';

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      explanation,
      classLevel,
      subject,
      chapter,
      difficulty,
    } = req.body;

    const question = await Question.create({
      questionText,
      options,
      correctAnswer,
      explanation,
      classLevel,
      subject,
      chapter,
      difficulty,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating question',
      error: error.message,
    });
  }
};

// @desc    Bulk create questions
// @route   POST /api/questions/bulk
// @access  Private/Admin
const bulkCreateQuestions = async (req, res) => {
  try {
    const incoming = Array.isArray(req.body.questions) ? req.body.questions : [];

    const docs = incoming.map((q) => ({
      ...q,
      createdBy: req.user._id,
    }));

    const inserted = await Question.insertMany(docs, {
      ordered: false,
      runValidators: true,
      lean: true,
    });

    return res.status(201).json({
      success: true,
      message: `Uploaded ${inserted.length} question(s) successfully.`,
      insertedCount: inserted.length,
    });
  } catch (error) {
    // insertMany with ordered:false can return partial failures
    if (error?.name === 'ValidationError' || error?.name === 'MongoBulkWriteError') {
      const writeErrors = error.writeErrors || [];
      const details = writeErrors.slice(0, 25).map((e) => ({
        index: e.index,
        message: e.errmsg || e.message || 'Invalid row',
      }));

      return res.status(400).json({
        success: false,
        message: 'Bulk upload contains invalid rows',
        insertedCount: error.result?.nInserted || 0,
        errors: details,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error uploading questions in bulk',
      error: error.message,
    });
  }
};

// @desc    Get all questions (with optional filters)
// @route   GET /api/questions
// @access  Private
const getAllQuestions = async (req, res) => {
  try {
    const { classLevel, subject, chapter, difficulty } = req.query;

    const filter = {};
    if (classLevel) filter.classLevel = classLevel;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    let query = Question.find(filter).sort({ createdAt: -1 });

    // Hide answers from students
    if (req.user.role === 'student') {
      query = query.select('-correctAnswer -explanation');
    }

    const questions = await query;

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};

// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    let query = Question.findById(req.params.id);

    // Hide answers from students
    if (req.user.role === 'student') {
      query = query.select('-correctAnswer -explanation');
    }

    const question = await query;

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message,
    });
  }
};

// @desc    Update a question
// @route   PATCH /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating question',
      error: error.message,
    });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message,
    });
  }
};

export { createQuestion, bulkCreateQuestions, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion };