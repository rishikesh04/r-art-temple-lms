import Attempt from '../models/attempt.model.js';
import Test from '../models/test.model.js';

// @desc    Submit a test and auto-calculate score
// @route   POST /api/attempts/submit/:testId
// @access  Private (Students only)
export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, timeTaken } = req.body;

    // Validate answers payload
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be a non-empty array',
      });
    }

    // Fetch test and questions
    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Only published tests can be attempted
    if (test.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'This test is not available for submission',
      });
    }

    // Student can only attempt their own class test
    if (test.classLevel !== req.user.classLevel) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to attempt this test',
      });
    }

    // Prevent duplicate attempts
    const existingAttempt = await Attempt.findOne({
      student: req.user._id,
      test: testId,
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
      });
    }

    // Valid test question IDs
    const validQuestionIds = new Set(test.questions.map((q) => q._id.toString()));

    // Validate submitted answers
    for (const ans of answers) {
      if (!ans.questionId || !validQuestionIds.has(ans.questionId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question submitted in answers',
        });
      }

      const validSelected =
        ans.selectedAnswer === null ||
        [0, 1, 2, 3].includes(Number(ans.selectedAnswer));

      if (!validSelected) {
        return res.status(400).json({
          success: false,
          message: 'selectedAnswer must be 0, 1, 2, 3, or null',
        });
      }
    }

    let calculatedScore = 0;
    const processedAnswers = [];

    const userAnswersMap = new Map(
      answers.map((a) => [a.questionId.toString(), a.selectedAnswer])
    );

    // Process only actual test questions
    test.questions.forEach((q) => {
      const selectedAnswer = userAnswersMap.has(q._id.toString())
        ? userAnswersMap.get(q._id.toString())
        : null;

      const normalizedAnswer =
        selectedAnswer !== null && selectedAnswer !== undefined
          ? Number(selectedAnswer)
          : null;

      const isCorrect =
        normalizedAnswer !== null && normalizedAnswer === q.correctAnswer;

      if (isCorrect) {
        calculatedScore += 1;
      }

      processedAnswers.push({
        question: q._id,
        selectedAnswer: normalizedAnswer,
        isCorrect,
      });
    });

    const attempt = await Attempt.create({
      student: req.user._id,
      test: test._id,
      answers: processedAnswers,
      score: calculatedScore,
      totalQuestions: test.questions.length,
      timeTaken: Number(timeTaken) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      attempt: {
        id: attempt._id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        submittedAt: attempt.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message,
    });
  }
};

// @desc    Get logged-in student's attempts
// @route   GET /api/attempts/my-attempts
// @access  Private (Students only)
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id })
      .populate('test', 'title subject classLevel totalMarks')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts',
      error: error.message,
    });
  }
};

// @desc    Get specific attempt details for logged-in student
// @route   GET /api/attempts/my-attempts/:id
// @access  Private (Students only)
export const getMyAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.id,
      student: req.user._id,
    })
      .populate('test', 'title subject totalMarks duration')
      .populate({
        path: 'answers.question',
        select: 'questionText options subject chapter difficulty',
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt details',
      error: error.message,
    });
  }
};

// @desc    Get all attempts
// @route   GET /api/attempts
// @access  Private/Admin
export const getAllAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate('student', 'name email classLevel')
      .populate('test', 'title subject classLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all attempts',
      error: error.message,
    });
  }
};