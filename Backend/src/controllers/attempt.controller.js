import Attempt from '../models/attempt.model.js';
import Test from '../models/test.model.js';

// @desc    Submit a test and auto-calculate score
// @route   POST /api/attempts/submit/:testId
// @access  Private (Students only)
export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers = [], timeTaken = 0 } = req.body;

    //  Only students can submit tests
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit tests',
      });
    }
    //Student must be approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved yet',
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

    // Prevent multiple submission 
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

    // Check test timing
    const now = new Date();

    if (now < new Date(test.startTime)) {
      return res.status(403).json({
        success: false,
        message: 'This test has not started yet',
      });
    }

    if (now > new Date(test.endTime)) {
      return res.status(403).json({
        success: false,
        message: 'This test has already ended',
      });
    }


    // Valid test question IDs
    const validQuestionIds = new Set(
      test.questions.map((q) => q._id.toString())
    );
    //Validate submitted answers
    for (const ans of answers) {
      if (!ans.questionId || !validQuestionIds.has(ans.questionId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question submitted in answers',
        });
      }

      if (
        ans.selectedAnswer !== null &&
        ans.selectedAnswer !== undefined &&
        ![0, 1, 2, 3].includes(Number(ans.selectedAnswer))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Selected answer must be 0, 1, 2, or 3',
        });
      }
    }

    //Calculate score securely
    let calculatedScore = 0;
    const processedAnswers = [];

    const userAnswersMap = new Map(
      answers.map((a) => [a.questionId.toString(), a.selectedAnswer])
    );

    test.questions.forEach((q) => {
      const selectedAnswer = userAnswersMap.get(q._id.toString());

      const isCorrect =
        selectedAnswer !== undefined &&
        selectedAnswer !== null &&
        Number(selectedAnswer) === q.correctAnswer;

      if (isCorrect) {
        calculatedScore += 1;
      }

      processedAnswers.push({
        question: q._id,
        selectedAnswer:
          selectedAnswer !== undefined ? Number(selectedAnswer) : null,
        isCorrect,
      });
    });


    //Save attempt

    const attempt = await Attempt.create({
      student: req.user._id,
      test: test._id,
      answers: processedAnswers,
      score: calculatedScore,
      totalQuestions: test.questions.length,
      timeTaken: Number(timeTaken) || 0,
    });


    //Do NOT reveal score immediately
    return res.status(201).json({
      success: true,
      message:
        'Test submitted successfully. Result will be available after the test ends.',
      attempt: {
        id: attempt._id,
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


    return res.status(500).json({
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
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view their attempts',
      });
    }
    const attempts = await Attempt.find({ student: req.user._id })
      .populate('test', 'title subject classLevel totalMarks')
      .sort({ createdAt: -1 });

    
    const formattedAttempts = attempts.map((attempt) => {
      const isResultAvailable =
        attempt.test && new Date() > new Date(attempt.test.endTime);

      return {
        id: attempt._id,
        test: attempt.test,
        submittedAt: attempt.createdAt,
        resultAvailable: isResultAvailable,
        score: isResultAvailable ? attempt.score : null,
        totalQuestions: isResultAvailable ? attempt.totalQuestions : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedAttempts.length,
      attempts: formattedAttempts,
    });
  } catch (error) {
    return res.status(500).json({
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

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view attempt details',
      });
    }


    const attempt = await Attempt.findOne({
      _id: req.params.id,
      student: req.user._id,
    })
      .populate('test', 'title subject totalMarks duration endTime')
      .populate({
        path: 'answers.question',
        select: 'questionText options correctAnswer explanation subject chapter difficulty',
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }
// IMPORTANT: Lock result until test end time
    const now = new Date();
    if (attempt.test && now < new Date(attempt.test.endTime)) {
      return res.status(403).json({
        success: false,
        message: 'Result is not available yet. Please wait until the test ends.',
      });
    }

    const accuracy =
      attempt.totalQuestions > 0
        ? Number(((attempt.score / attempt.totalQuestions) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        testTitle: attempt.test?.title || 'Deleted Test',
        subject: attempt.test?.subject || null,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        accuracy,
        submittedAt: attempt.createdAt,
        answers: attempt.answers.map((ans) => ({
          questionId: ans.question?._id || null,
          questionText: ans.question?.questionText || '',
          options: ans.question?.options || [],
          selectedAnswer: ans.selectedAnswer,
          correctAnswer: ans.question?.correctAnswer ?? null,
          isCorrect: ans.isCorrect,
          explanation: ans.question?.explanation || '',
          subject: ans.question?.subject || '',
          chapter: ans.question?.chapter || '',
          difficulty: ans.question?.difficulty || '',
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching attempt details',
      error: error.message,
    });
  }
};

// @desc    Get all attempts (Admin only)
// @route   GET /api/attempts
// @access  Private/Admin
export const getAllAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate('student', 'name email classLevel')
      .populate('test', 'title subject classLevel')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching all attempts',
      error: error.message,
    });
  }
};