const mongoose = require('mongoose');
const validator = require('validator');

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A Question must have a title'],
    },
    content: {
      type: String,
      required: [true, 'A Question must have the content'],
    },
    createBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    vote: {
      type: Number,
      default: 0,
    },
    numAnswer: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
