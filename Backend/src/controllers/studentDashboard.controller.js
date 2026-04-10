import Test from '../models/test.model.js';
import Attempt from '../models/attempt.model.js';

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Approved Students Only)
export const getStudentDashboard = async (req, res) => {
  try {
    // SECURITY: Only allow students
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view the student dashboard.',
      });
    }

    //  SECURITY: Ensure student is approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. You cannot access the dashboard yet.',
      });
    }

    const now = new Date();

    //  Fetch all attempts for this student
    const attempts = await Attempt.find({ student: req.user._id })
      .populate({ path: 'test', select: 'title endTime' })
      .sort({ createdAt: -1 })
      .lean();

    // Extract already attempted test IDs
    const attemptedTestIds = attempts
      .map((attempt) => (attempt.test ? attempt.test._id : null))
      .filter(Boolean);

    //  Calculate stats
    const completedTestsCount = attempts.length;

    // Average score should only be visible after a test ends (backend-enforced)
    const endedAttempts = attempts.filter(
      (a) => a.test && a.test.endTime && now > new Date(a.test.endTime)
    );
    const endedCount = endedAttempts.length;
    const totalScore = endedAttempts.reduce((acc, current) => acc + (current.score || 0), 0);
    const averageScore = endedCount > 0 ? Number((totalScore / endedCount).toFixed(2)) : null;

    //  Recent attempts
    const recentAttempts = attempts.slice(0, 5).map((attempt) => ({
      attemptId: attempt._id,
      testTitle: attempt.test ? attempt.test.title : 'Deleted Test',
      score:
        attempt.test && attempt.test.endTime && now > new Date(attempt.test.endTime)
          ? attempt.score
          : null,
      totalQuestions:
        attempt.test && attempt.test.endTime && now > new Date(attempt.test.endTime)
          ? attempt.totalQuestions
          : null,
      submittedAt: attempt.createdAt,
    }));

    // Available tests
    const availableTests = await Test.find({
      classLevel: req.user.classLevel,
      status: 'published',
      startTime: { $lte: now },
      endTime: { $gt: now },
      _id: { $nin: attemptedTestIds },
    })
      .select('title subject chapter duration totalMarks startTime endTime')
      .sort({ startTime: 1 })
      .lean();

    // Upcoming tests
    const upcomingTests = await Test.find({
      classLevel: req.user.classLevel,
      status: 'published',
      startTime: { $gt: now },
    })
      .select('title subject chapter duration totalMarks startTime endTime')
      .sort({ startTime: 1 })
      .lean();

    //  Return dashboard response
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          completedTestsCount,
          averageScore,
          availableTestsCount: availableTests.length,
          upcomingTestsCount: upcomingTests.length,
        },
        availableTests,
        upcomingTests,
        recentAttempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student dashboard.',
    });
  }
};