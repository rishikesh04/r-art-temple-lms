import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    testType: {
      type: String,
      enum: ['live', 'practice'],
      default: 'live',
    },
    // mode: {
    //   type: String,
    //   enum: ['live', 'practice'],
    //   default: 'live',
    // },
    classLevel: {
      type: String,
      required: [true, 'Class level is required'],
      enum: ['6', '7', '8', '9', '10'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: ['Math', 'Science'],
    },
    chapter: {
      type: String,
      trim: true,
    },
    questions: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
      ],
      required: [true, 'Questions array is required'],
      validate: {
        validator: function (array) {
          return array && array.length > 0;
        },
        message: 'A test must contain at least one question.',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'], // Duration in minutes
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
    },
    startTime: {
      type: Date,
      required: [
        function () { return this.testType === 'live'; },
        'Start time is required for live tests'
      ],
    },
    endTime: {
      type: Date,
      required: [
        function () { return this.testType === 'live'; },
        'End time is required for live tests'
      ],
      validate: {
        validator: function (value) {
          // Ensure endTime is strictly greater than startTime if both exist
          if (this.startTime && value) {
            return value > this.startTime;
          }
          return true;
        },
        message: 'End time must be greater than start time',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Query performance indexes for student/admin dashboards and test listings
testSchema.index({ classLevel: 1, status: 1, testType: 1, startTime: 1, endTime: 1 });
testSchema.index({ subject: 1, chapter: 1, createdAt: -1 });
testSchema.index({ createdBy: 1, createdAt: -1 });

const Test = mongoose.model('Test', testSchema);

export default Test;