const Answer = require('../models/answer-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const { startSession } = require('mongoose');
const User = require('../models/user-model');
const Noti = require('../models/notification-model');
const Question = require('../models/question-model');

const createAnswer = CatchAsync(async (req, res, next) => {
  const session = await startSession();
  req.body.createBy = req.currentUser._id;
  session.withTransaction(async () => {
    const questtion = await Question.findById(req.body.questionId);
    const newAnswer = await Answer.create([req.body], { session });
    const que = await Question.findOneAndUpdate(
      { _id: req.body.questionId },
      { $inc: { numAnswer: +1 } },
      { session }
    );
    const newNoti = await Noti.create(
      [
        {
          content: 'Your Question have new answer',
          notiFor: questtion.createBy,
          category: 'have-new-answer',
          question:req.body.questionId,
        },
      ],
      { session }
    );
    res.status(201).json({
      status: 'success',
      data: {
        answer: newAnswer,
        que
      },
    });
  });
});

const getAllAnswers = CatchAsync(async (req, res, next) => {
  const answers = new APIFeatures(Answer.find().populate({
    path: 'createBy',
    select: ['userName', 'avatar'],
  }), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();
const result = await answers.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getAnswersOfQuestion = CatchAsync(async (req, res, next) => {
  const answers = await Answer.find();
  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: {
      answers,
    },
  });
});


const getAnswerById = CatchAsync(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return next(new ErrorHandler('No Answer found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      answer,
    },
  });
});

const updateAnswer = CatchAsync(async (req, res, next) => {
  const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!answer) {
    return next(new ErrorHandler('No Answer found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      answer,
    },
  });
});

const deleteAnswer = CatchAsync(async (req, res, next) => {
  const answer = await Answer.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!answer) {
    return next(new ErrorHandler('No Answer found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
};
