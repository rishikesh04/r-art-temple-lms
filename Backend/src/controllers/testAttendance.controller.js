import Test from '../models/test.model.js';
import User from '../models/user.model.js';
import Attempt from '../models/attempt.model.js';

// @desc    Get attendance, insights, and performance for a specific test
// @route   GET /api/admin/tests/:testId/attendance
// @access  Private (Admin Only)
export const getTestAttendance = async (req, res) => {
  try {
    const { testId } = req.params;

    // Defensive admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin resources only.',
      });
    }

    // Get safe test info only
    const test = await Test.findById(testId)
      .select('title classLevel subject chapter startTime endTime status')
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found.',
      });
    }

    // Eligible students = approved students of that class
    const eligibleStudents = await User.find({
      role: 'student',
      status: 'approved',
      classLevel: test.classLevel,
    })
      .select('_id name email phone')
      .lean();

    // Attempts for this test
    const attempts = await Attempt.find({ test: testId })
      .select('_id student score totalQuestions createdAt')
      .populate({
        path: 'student',
        select: '_id name email phone classLevel status role',
      })
      .lean();

    // Eligible student ID set
    const eligibleStudentIds = new Set(
      eligibleStudents.map((student) => student._id.toString())
    );

    // Keep only attempts made by currently eligible students
    const validAttempts = attempts.filter((attempt) => {
      return (
        attempt.student &&
        eligibleStudentIds.has(attempt.student._id.toString())
      );
    });

    // Build attended student IDs from valid attempts only
    const attendedStudentIds = new Set(
      validAttempts.map((attempt) => attempt.student._id.toString())
    );

    // Safe attended student response
    const attendedStudents = validAttempts.map((attempt) => ({
      attemptId: attempt._id,
      studentId: attempt.student._id,
      name: attempt.student.name,
      email: attempt.student.email,
      phone: attempt.student.phone,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.createdAt,
    }));

    // Absent students = eligible students who did not attempt
    const absentStudents = eligibleStudents
      .filter((student) => !attendedStudentIds.has(student._id.toString()))
      .map((student) => ({
        studentId: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
      }));

    // Attendance calculations
    const totalEligibleStudents = eligibleStudents.length;
    const attendedCount = attendedStudentIds.size;
    const absentCount = absentStudents.length;

    const attendancePercentage =
      totalEligibleStudents > 0
        ? Number(((attendedCount / totalEligibleStudents) * 100).toFixed(2))
        : 0;

    // Performance calculations (only from valid eligible attempts)
    let totalScore = 0;
    let highestScore = 0;
    let lowestScore = validAttempts.length > 0 ? Infinity : 0;

    validAttempts.forEach((attempt) => {
      totalScore += attempt.score;
      if (attempt.score > highestScore) highestScore = attempt.score;
      if (attempt.score < lowestScore) lowestScore = attempt.score;
    });

    const averageScore =
      validAttempts.length > 0
        ? Number((totalScore / validAttempts.length).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        test: {
          id: test._id,
          title: test.title,
          classLevel: test.classLevel,
          subject: test.subject,
          chapter: test.chapter,
          startTime: test.startTime,
          endTime: test.endTime,
          status: test.status,
        },
        attendance: {
          totalEligibleStudents,
          attendedCount,
          absentCount,
          attendancePercentage,
        },
        performance: {
          averageScore,
          highestScore,
          lowestScore,
        },
        attendedStudents,
        absentStudents,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID format.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching test attendance.',
      error: error.message,
    });
  }
};