import Attempt from '../models/attempt.model.js';
import Test from '../models/test.model.js';

// @desc    Get analytics overview for the logged-in student
// @route   GET /api/analytics/me/overview
// @access  Private (Approved Students Only)
export const getStudentOverview = async (req, res) => {
  try {
    // Only students can access
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view this analytics overview.',
      });
    }

    // Student must be approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved yet.',
      });
    }

    // Count published tests available for this student's class
    const totalAvailableTests = await Test.countDocuments({
      classLevel: req.user.classLevel,
      status: 'published',
    });

    // Fetch all attempts for stats calculation
    const allAttempts = await Attempt.find({ student: req.user._id }).lean();

    const totalAttempts = allAttempts.length;

    let totalScore = 0;
    let bestScore = 0;

    allAttempts.forEach((attempt) => {
      totalScore += attempt.score;
      if (attempt.score > bestScore) {
        bestScore = attempt.score;
      }
    });

    const averageScore =
      totalAttempts > 0 ? Number((totalScore / totalAttempts).toFixed(2)) : 0;

    // Fetch only recent 5 attempts with test title
    const recentAttemptsRaw = await Attempt.find({ student: req.user._id })
      .populate('test', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentAttempts = recentAttemptsRaw.map((attempt) => ({
      id: attempt._id,
      testTitle: attempt.test ? attempt.test.title : 'Deleted Test',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        averageScore,
        bestScore,
        totalAvailableTests,
        recentAttempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get topic-wise performance for the logged-in student
// @route   GET /api/analytics/topics
// @access  Private (Approved Students Only)
export const getTopicPerformance = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view this analytics.',
      });
    }

    // Fetch all attempts with populated questions to get topics/chapters
    const attempts = await Attempt.find({ student: req.user._id })
      .populate({
        path: 'answers.question',
        select: 'topics chapter subject',
      })
      .lean();

    const topicStats = {};

    attempts.forEach((attempt) => {
      attempt.answers.forEach((ans) => {
        if (!ans.question) return;

        // Use topics array if available and not empty, fallback to chapter
        const topicsToShow = (ans.question.topics && ans.question.topics.length > 0)
          ? ans.question.topics
          : [ans.question.chapter || 'Unknown'];
        
        topicsToShow.forEach(topicName => {
          if (!topicStats[topicName]) {
            topicStats[topicName] = { 
              topic: topicName,
              subject: ans.question.subject,
              correctCount: 0, 
              totalSeen: 0 
            };
          }

          topicStats[topicName].totalSeen += 1;
          if (ans.isCorrect) {
            topicStats[topicName].correctCount += 1;
          }
        });
      });
    });

    // Calculate percentages and format
    const result = Object.values(topicStats).map((s) => {
      const accuracy = s.totalSeen > 0 ? Math.round((s.correctCount / s.totalSeen) * 100) : 0;
      return {
        topic: s.topic,
        subject: s.subject,
        wrongCount: s.totalSeen - s.correctCount,
        totalSeen: s.totalSeen,
        accuracy,
        status: s.totalSeen >= 3 ? 'sufficient' : 'insufficient'
      };
    });

    // Sort: sufficient data first, then by accuracy (weak areas first)
    result.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'sufficient' ? -1 : 1;
      }
      return a.accuracy - b.accuracy;
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching topic analytics',
      error: error.message,
    });
  }
};