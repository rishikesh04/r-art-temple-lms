import Attempt from '../models/attempt.model.js';
import Test from '../models/test.model.js';

// @desc    Submit a test and auto-calculate score
// @route   POST /api/attempts/submit/:testId
// @access  Private (Students only)
export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers = [], timeTaken = 0 } = req.body;
    const submitGraceMs = Number(process.env.ATTEMPT_SUBMIT_GRACE_MS || 15000);

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

    // Check and handle attempts based on test type
    const latestAttempt = await Attempt.findOne({
      student: req.user._id,
      test: testId,
    }).sort({ attemptNumber: -1 });

    const isLive = test.mode !== 'practice';

    if (isLive && latestAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
      });
    }

    const nextAttemptNumber = latestAttempt ? latestAttempt.attemptNumber + 1 : 1;

    // Check test timing (ignore end time for practice tests)
    const now = new Date();

    if (isLive && test.startTime && now < new Date(test.startTime)) {
      return res.status(403).json({
        success: false,
        message: 'This test has not started yet',
      });
    }

    if (isLive) {
      const endAtMs = new Date(test.endTime).getTime();
      const effectiveGraceMs = Number.isFinite(submitGraceMs) ? Math.max(0, submitGraceMs) : 15000;
      if (Number.isFinite(endAtMs) && now.getTime() > endAtMs + effectiveGraceMs) {
        return res.status(403).json({
          success: false,
          message: 'This test has already ended',
        });
      }
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
      attemptNumber: nextAttemptNumber,
    });


    const msg = test.mode === 'live'
      ? 'Test submitted successfully. Result will be available after the test ends.'
      : 'Practice test submitted successfully. Result is available now.';

    return res.status(201).json({
      success: true,
      message: msg,
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
    const totalCount = await Attempt.countDocuments({ student: req.user._id });

    if (req.query.nopagination === 'true') {
      const attempts = await Attempt.find({ student: req.user._id })
        .populate('test', 'title subject classLevel totalMarks mode endTime')
        .sort({ createdAt: -1 })
        .lean();
      
      const formattedAttempts = attempts.map((attempt) => {
        const isPractice = attempt.test && attempt.test.mode === 'practice';
        const isResultAvailable =
          isPractice || (attempt.test && new Date() > new Date(attempt.test.endTime));

        return {
          id: attempt._id,
          test: attempt.test,
          submittedAt: attempt.createdAt,
          attemptNumber: attempt.attemptNumber,
          resultAvailable: isResultAvailable,
          score: isResultAvailable ? attempt.score : null,
          totalQuestions: isResultAvailable ? attempt.totalQuestions : null,
        };
      });

      return res.status(200).json({
        success: true,
        totalCount,
        attempts: formattedAttempts,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const attempts = await Attempt.find({ student: req.user._id })

    const formattedAttempts = attempts.map((attempt) => {
      const isPractice = attempt.test && attempt.test.mode === 'practice';
      const isResultAvailable =
        isPractice || (attempt.test && new Date() > new Date(attempt.test.endTime));

      return {
        id: attempt._id,
        test: attempt.test,
        submittedAt: attempt.createdAt,
        attemptNumber: attempt.attemptNumber,
        resultAvailable: isResultAvailable,
        score: isResultAvailable ? attempt.score : null,
        totalQuestions: isResultAvailable ? attempt.totalQuestions : null,
      };
    });

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
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
      .populate('test', 'title description subject totalMarks duration startTime endTime mode')
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
    // IMPORTANT: Lock result until test end time (UNLESS practice test)
    const now = new Date();
    if (attempt.test && attempt.test.mode !== 'practice' && now < new Date(attempt.test.endTime)) {
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
        testId: attempt.test?._id || null,
        testTitle: attempt.test?.title || 'Deleted Test',
        testDescription: attempt.test?.description || '',
        mode: attempt.test?.mode || 'live',
        duration: attempt.test?.duration || 0,
        testStartTime: attempt.test?.startTime || null,
        testEndTime: attempt.test?.endTime || null,
        subject: attempt.test?.subject || null,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        attemptNumber: attempt.attemptNumber,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalCount = await Attempt.countDocuments();
    const attempts = await Attempt.find()
      .populate('student', 'name email classLevel')
      .populate('test', 'title subject classLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
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

// @desc    Get detailed review of a specific attempt (with time-lock for students)
// @route   GET /api/attempts/:attemptId/review
// @access  Private (Student & Admin)
export const getAttemptReview = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId)
      .populate({
        path: 'test',
        select: 'title subject chapter mode endTime',
      })
      .populate({
        path: 'answers.question',
        select: 'questionText options correctAnswer explanation',
      })
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    const isStudent = req.user.role === 'student';
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Student-specific restrictions
    if (isStudent) {
      // Student can only review their own attempt
      if (attempt.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own attempts',
        });
      }

      // Student can review only after test ends (unless practice test)
      if (attempt.test && attempt.test.mode !== 'practice') {
        const now = new Date();
        const testEndTime = new Date(attempt.test.endTime);

        if (now < testEndTime) {
          return res.status(403).json({
            success: false,
            message:
              'Test review is locked. You can view answers and explanations only after the test has ended.',
          });
        }
      }
    }

    const safeAnswers = attempt.answers.map((ans) => {
      const q = ans.question;

      if (!q) {
        return {
          questionId: null,
          questionText: 'This question was removed by the administrator.',
          options: [],
          selectedAnswer: ans.selectedAnswer,
          correctAnswer: null,
          explanation: null,
          isCorrect: ans.isCorrect,
        };
      }

      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        isCorrect: ans.isCorrect,
      };
    });

    const reviewData = {
      attemptId: attempt._id,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      attemptNumber: attempt.attemptNumber,
      submittedAt: attempt.createdAt,
      test: attempt.test
        ? {
          id: attempt.test._id,
          title: attempt.test.title,
          subject: attempt.test.subject,
          chapter: attempt.test.chapter,
          mode: attempt.test.mode,
        }
        : {
          id: null,
          title: 'Deleted Test',
          subject: 'N/A',
          chapter: 'N/A',
          mode: 'live',
        },
      answers: safeAnswers,
    };

    return res.status(200).json({
      success: true,
      message: 'Attempt review fetched successfully',
      data: reviewData,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid attempt ID format',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching attempt review',
      error: error.message,
    });
  }
};