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
        select: 'topic chapter subject',
      })
      .lean();

    const topicStats = {};

    attempts.forEach((attempt) => {
      // Only include attempts where result is available (test has ended)
      // Note: We'll assume if score is recorded, it's valid for analytics
      // but in this LMS, scores are recorded even if not revealed to students yet.
      // However, for personal analytics, we might want to only show "Final" results.
      // Let's stick to all attempts that have answers for now to give most data.
      
      attempt.answers.forEach((ans) => {
        if (!ans.question) return;

        // Use topic if available, fallback to chapter
        const topicName = ans.question.topic || ans.question.chapter || 'Unknown';
        
        if (!topicStats[topicName]) {
          topicStats[topicName] = { 
            topic: topicName,
            subject: ans.question.subject,
            correct: 0, 
            total: 0 
          };
        }

        topicStats[topicName].total += 1;
        if (ans.isCorrect) {
          topicStats[topicName].correct += 1;
        }
      });
    });

    // Calculate percentages and format
    const result = Object.values(topicStats).map((s) => ({
      ...s,
      accuracy: Math.round((s.correct / s.total) * 100),
    }));

    // Sort by accuracy (weak areas first)
    result.sort((a, b) => a.accuracy - b.accuracy);

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