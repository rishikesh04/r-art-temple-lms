import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import Test from '../models/test.model.js';
import Attempt from '../models/attempt.model.js';

// @desc    Get admin dashboard statistics and recent activities
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
export const getAdminDashboard = async (req, res) => {
  try {
    // Defensive role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin resources only.',
      });
    }

    const [
      totalStudents,
      approvedStudents,
      pendingStudents,
      rejectedStudents,
      totalQuestions,
      totalTests,
      publishedTests,
      draftTests,
      totalAttempts,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'approved' }),
      User.countDocuments({ role: 'student', status: 'pending' }),
      User.countDocuments({ role: 'student', status: 'rejected' }),
      Question.countDocuments(),
      Test.countDocuments(),
      Test.countDocuments({ status: 'published' }),
      Test.countDocuments({ status: 'draft' }),
      Attempt.countDocuments(),
    ]);

    const rawRecentStudents = await User.find({ role: 'student' })
      .select('name email phone classLevel status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentStudents = rawRecentStudents.map((student) => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      phone: student.phone,
      classLevel: student.classLevel,
      status: student.status,
      createdAt: student.createdAt,
    }));

    const rawRecentAttempts = await Attempt.find()
      .populate('student', 'name email')
      .populate('test', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentAttempts = rawRecentAttempts.map((attempt) => ({
      attemptId: attempt._id.toString(),
      studentName: attempt.student ? attempt.student.name : 'Deleted Student',
      studentEmail: attempt.student ? attempt.student.email : 'N/A',
      testTitle: attempt.test ? attempt.test.title : 'Deleted Test',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          approvedStudents,
          pendingStudents,
          rejectedStudents,
          totalQuestions,
          totalTests,
          publishedTests,
          draftTests,
          totalAttempts,
        },
        recentStudents,
        recentAttempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching admin dashboard data.',
      error: error.message,
    });
  }
};