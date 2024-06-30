const mongoose = require('mongoose');
const validator = require('validator');


const reportSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'A report must have the content'],
    },
    createBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    postReported: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },

  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
