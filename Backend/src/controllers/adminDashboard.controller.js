import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import Test from '../models/test.model.js';
import Attempt from '../models/attempt.model.js';

// @desc    Get admin dashboard statistics and recent activities
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
export const getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const classes = ['6', '7', '8', '9', '10'];
    const now = new Date();

    // 1. Parallel counts and basic stats
    const [
      totalStudents,
      pendingStudents,
      totalQuestions,
      totalTests,
      allClassStats,
      allPendingStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'pending' }),
      Question.countDocuments(),
      Test.countDocuments(),
      // Grouped counts for classes
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$classLevel', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student', status: 'pending' } },
        { $group: { _id: '$classLevel', count: { $sum: 1 } } }
      ])
    ]);

    // Format class stats
    const totalByClass = {};
    const pendingByClass = {};
    classes.forEach(c => {
      totalByClass[c] = allClassStats.find(s => s._id === c)?.count || 0;
      pendingByClass[c] = allPendingStats.find(s => s._id === c)?.count || 0;
    });

    // 2. Live Tests (startTime <= now <= endTime)
    const liveTestsRaw = await Test.find({
      status: 'published',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).lean();

    const liveTests = await Promise.all(liveTestsRaw.map(async (test) => {
      const [submittedCount, eligibleCount] = await Promise.all([
        Attempt.countDocuments({ test: test._id }),
        User.countDocuments({ role: 'student', status: 'approved', classLevel: test.classLevel })
      ]);
      return {
        id: test._id,
        title: test.title,
        classLevel: test.classLevel,
        subject: test.subject,
        endTime: test.endTime,
        submittedCount,
        eligibleCount
      };
    }));

    // 3. Recent Tests (last 5 published or completed)
    const recentTests = await Test.find({ status: 'published' })
      .sort({ startTime: -1 })
      .limit(5)
      .lean();

    // 4. Recent Students
    const recentStudents = await User.find({ role: 'student' })
      .select('name email classLevel status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          pendingStudents,
          totalQuestions,
          totalTests,
          totalByClass,
          pendingByClass
        },
        liveTests,
        recentTests: recentTests.map(t => ({
          id: t._id,
          title: t.title,
          classLevel: t.classLevel,
          subject: t.subject,
          startTime: t.startTime
        })),
        recentStudents: recentStudents.map(s => ({
          id: s._id,
          name: s.name,
          email: s.email,
          classLevel: s.classLevel,
          status: s.status,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while gathering dashboard insights.',
      error: error.message
    });
  }
};