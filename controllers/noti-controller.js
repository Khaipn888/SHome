const User = require('../models/user-model');
const Post = require('../models/post-model');
const Vote = require('../models/vote-model');
const Noti = require('../models/notification-model');
const Question = require('../models/question-model');
const Answer = require('../models/answer-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const sendEmail = require('../utils/send-email');
const crypto = require('crypto');
const { startSession } = require('mongoose');

const getNotifications = CatchAsync(async (req, res, next) => {
  let status = ['readed', 'unread'];
  if (req.query?.status) {
    status = [req.query.status];
  }
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  const notifications = new APIFeatures(
    Noti.find({ notiFor: userId, status: { $in: status } }).populate([
      {
        path: 'post',
        strictPopulate: false,
        populate: {
          path: 'createBy',
          select: ['userName', 'avatar'],
        },
      },
      {
        path: 'question',
        strictPopulate: false,
        populate: {
          path: 'createBy',
          select: ['userName', 'avatar'],
        },
      },
      {
        path: 'report',
        strictPopulate: false,
        populate: {
          path: 'createBy',
          select: ['userName', 'avatar'],
        },
      },
    ]),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await notifications.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const readNoti = CatchAsync(async (req, res, next) => {
  const userId = req.currentUser._id;
  const notiId = req.params.id;
  const noti = await Noti.findOneAndUpdate(
    {
      _id: notiId,
      notiFor: userId,
    },
    {
      status: 'readed',
    }
  );
  if (!noti) return next(new ErrorHandler('Notification does not exist', 404));
  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  getNotifications,
  readNoti,
};
