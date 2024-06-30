const mongoose = require('mongoose');
const validator = require('validator');

const answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Missing answer content'],
    },
    questionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Question',
    },
    createBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    vote: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
