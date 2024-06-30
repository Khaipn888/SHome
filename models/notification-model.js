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
      enum: ['readed', 'not-read'],
      default: 'not-read',
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
    idLink: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'missing idLink'],
    },
  },
  { timestamps: true }
);

const Noti = mongoose.model('Noti', notiSchema);

module.exports = Noti;
