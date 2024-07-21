const mongoose = require('mongoose');
const validator = require('validator');

const notiSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'A noti must have the content'],
    },
    notiFor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'missing notiFor'],
    },
    status: {
      type: String,
      enum: ['readed', 'unread'],
      default: 'unread',
    },
    category: {
      type: String,
      enum: [
        'request-create-post',
        'create-post-successfully',
        'report',
        'noti-from-admin',
        'request-create-question',
        'create-questtion-successfully',
        'have-new-answer',
        'approve',
        'not-approve',
        'disable-post',
        'disable-account'
      ],
      required: [true, 'missing category'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    },
    questtion: {
      type: mongoose.Schema.ObjectId,
      ref: 'Question'
      },
    report: {
      type: mongoose.Schema.ObjectId,
      ref: 'Report'
    }
  },
  { timestamps: true }
);

const Noti = mongoose.model('Noti', notiSchema);

module.exports = Noti;
