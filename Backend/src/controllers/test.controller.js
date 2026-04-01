import Test from '../models/test.model.js';

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
export const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      classLevel,
      subject,
      chapter,
      questions,
      duration,
      totalMarks,
      startTime,
      endTime,
      status,
    } = req.body;

    const newTest = await Test.create({
      title,
      description,
      classLevel,
      subject,
      chapter,
      questions,
      duration,
      totalMarks,
      startTime,
      endTime,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test: newTest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating test',
      error: error.message,
    });
  }
};

// @desc    Get all tests (with optional query filters)
// @route   GET /api/tests
// @access  Private (Admin & Approved Students)
export const getAllTests = async (req, res) => {
  try {
    const { classLevel, subject, chapter, status } = req.query;

    const filter = {};

    // Admin can filter freely
    if (req.user.role === 'admin') {
      if (classLevel) filter.classLevel = classLevel;
      if (subject) filter.subject = subject;
      if (chapter) filter.chapter = chapter;
      if (status) filter.status = status;
    } else {
      // Student should only see tests for their own class
      filter.classLevel = req.user.classLevel;

      // Student should only see published tests
      filter.status = 'published';

      // Optional filters for student
      if (subject) filter.subject = subject;
      if (chapter) filter.chapter = chapter;
    }

    const tests = await Test.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tests',
      error: error.message,
    });
  }
};

// @desc    Get a single test by ID
// @route   GET /api/tests/:id
// @access  Private
export const getTestById = async (req, res) => {
  try {
    const queryFilter = { _id: req.params.id };

    // Restrict students to only their own class + published tests
    if (req.user.role !== 'admin') {
      queryFilter.classLevel = req.user.classLevel;
      queryFilter.status = 'published';
    }

    let query = Test.findOne(queryFilter);

    // Admin can see full question details
    if (req.user.role === 'admin') {
      query = query.populate('questions');
    } else {
      // Students should not see answers/explanations
      query = query.populate({
        path: 'questions',
        select: '-correctAnswer -explanation',
      });
    }

    const test = await query;

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message,
    });
  }
};

// @desc    Update a test
// @route   PATCH /api/tests/:id
// @access  Private/Admin
export const updateTest = async (req, res) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      test: updatedTest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating test',
      error: error.message,
    });
  }
};

// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
export const deleteTest = async (req, res) => {
  try {
    const deletedTest = await Test.findByIdAndDelete(req.params.id);

    if (!deletedTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting test',
      error: error.message,
    });
  }
};