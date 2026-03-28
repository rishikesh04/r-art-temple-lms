const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true,
        },
        options: {
            type: [String],
            required: [true, 'Options are required'],

            validate: {
                validator: function (arr) {
                    return arr.length === 4 && arr.every((option) => typeof option === 'string' && option.trim() !== '');
                },
                message: 'A question must have exactly 4 non-empty options',
            },
        },
        correctAnswer: {
            type: Number,
            required: [true, 'Correct answer index is required'],
            min: [0, 'Correct answer must be an index between 0 and 3'],
            max: [3, 'Correct answer must be an index between 0 and 3'],
        },
        explanation: {
            type: String,
            trim: true,
        },
        classLevel: {
            type: String,
            required: [true, 'Class level is required'],
            enum: ['6', '7', '8', '9', '10'],
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            enum: ['Math', 'Science'], // Can be expanded later if needed
        },
        chapter: {
            type: String,
            required: [true, 'Chapter name is required'],
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;