import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedAnswer: {
      type: Number,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attempts for the same attemptNumber
attemptSchema.index({ student: 1, test: 1, attemptNumber: 1 }, { unique: true });
attemptSchema.index({ student: 1, createdAt: -1 });
attemptSchema.index({ test: 1, createdAt: -1 });

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;