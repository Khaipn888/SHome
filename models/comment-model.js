const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A post must have a title'],
  },
  reply_to: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
},
{ timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
