const Question = require('../models/question-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const { startSession } = require('mongoose');
const User = require('../models/user-model');
const Noti = require('../models/notification-model');

const createQuestion = CatchAsync(async (req, res, next) => {
  const session = await startSession();
  req.body.createBy = req.currentUser._id;
  session.withTransaction(async () => {
    const admin = await User.findOne({ role: 'admin' });
    const newQuestion = await Question.create([req.body], { session });
    console.log(newQuestion[0]._id);
    const newNoti = await Noti.create(
      [
        {
          content: 'User request to create new question',
          notiFor: admin._id,
          category: 'request-create-question',
          question: newQuestion[0]._id,
        },
      ],
      { session }
    );
    res.status(201).json({
      status: 'success',
      data: {
        question: newQuestion,
      },
    });
  });
});

const getAllQuestions = CatchAsync(async (req, res, next) => {
  const search = req.query.search || '';
  let status = ['active', 'pending', 'disable'];
  if (!req?.currentUser || req?.currentUser?.role !== 'admin') {
    status = ['active'];
  }
  if (req?.currentUser?.role !== 'admin' && req.query?.status) {
    status = [req.query.status];
  }
  const questions = new APIFeatures(
    Question.find({
      title: { $regex: search, $options: 'i' },
      status: { $in: status },
    }).populate({
      path: 'createBy',
      select: ['userName', 'avatar'],
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await questions.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getQuestionById = CatchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new ErrorHandler('No Question found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      question,
    },
  });
});

const updateQuestion = CatchAsync(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) {
    return next(new ErrorHandler('No Question found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      question,
    },
  });
});

const deleteQuestion = CatchAsync(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) {
    return next(new ErrorHandler('No Question found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
