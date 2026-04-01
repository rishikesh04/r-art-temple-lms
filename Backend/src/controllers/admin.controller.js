import User from '../models/user.model.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private / Admin Only
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// @desc    Get all pending students
// @route   GET /api/admin/students/pending
// @access  Private / Admin Only
const getPendingStudents = async (req, res) => {
  try {
    const pendingStudents = await User.find({
      role: 'student',
      status: 'pending',
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students: pendingStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending students',
      error: error.message,
    });
  }
};

// @desc    Approve a student
// @route   PATCH /api/admin/students/:id/approve
// @access  Private / Admin Only
const approveStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve this user. User is not a student.',
      });
    }

    if (student.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Student is already approved.',
      });
    }

    student.status = 'approved';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student approved successfully. They can now log in.',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        classLevel: student.classLevel,
        status: student.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving student',
      error: error.message,
    });
  }
};

// @desc    Reject a student
// @route   PATCH /api/admin/students/:id/reject
// @access  Private / Admin Only
const rejectStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject this user. User is not a student.',
      });
    }

    if (student.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Student is already rejected.',
      });
    }

    student.status = 'rejected';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student has been rejected.',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        classLevel: student.classLevel,
        status: student.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting student',
      error: error.message,
    });
  }
};

export { getAllStudents, getPendingStudents, approveStudent, rejectStudent };