import Attempt from '../models/attempt.model.js';
import Test from '../models/test.model.js';

// @desc    Get leaderboard for a specific test
// @route   GET /api/leaderboard/test/:testId
// @access  Private (Admin + Eligible Students)
export const getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    //  Find test
    const test = await Test.findById(testId).select(
      'title subject classLevel totalMarks status endTime mode'
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    //  Student access control
    if (req.user.role === 'student') {
      if (test.status !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'Leaderboard not available for this test yet',
        });
      }

      if (test.classLevel !== req.user.classLevel) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this leaderboard',
        });
      }
    }

    // IMPORTANT: Students cannot see leaderboard before test ends (unless practice test)
    const now = new Date();
    const isPractice = test.mode === 'practice';
    if (!isPractice && req.user.role === 'student' && now < new Date(test.endTime)) {
      return res.status(403).json({
        success: false,
        message: 'Leaderboard will be available after the test ends.',
      });
    }
    //  Get all attempts for this test (ONLY first attempt for leaderboard)
    const attempts = await Attempt.find({ test: testId, attemptNumber: 1 })
      .populate('student', 'name classLevel')
      .sort({
        score: -1,       // Higher score first
        timeTaken: 1,    // Lower time taken first
        createdAt: 1,    // Earlier submission first
      })
      .lean();

    //  Build leaderboard
    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      studentId: attempt.student?._id,
      studentName: attempt.student?.name || 'Unknown Student',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage:
        attempt.totalQuestions > 0
          ? Number(((attempt.score / attempt.totalQuestions) * 100).toFixed(2))
          : 0,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.createdAt,
    }));

    res.status(200).json({
      success: true,
      test: {
        id: test._id,
        title: test.title,
        subject: test.subject,
        classLevel: test.classLevel,
        totalMarks: test.totalMarks,
      },
      totalParticipants: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};