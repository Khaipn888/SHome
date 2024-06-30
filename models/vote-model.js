const mongoose = require('mongoose');
const validator = require('validator');

const voteSchema = new mongoose.Schema(
  {
    voteBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: ['question', 'answer'],
      required: [true, "Missing category"]
    },
    voteFor: mongoose.Schema.ObjectId,
  },
  { timestamps: true }
);

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
