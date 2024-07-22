const Comment = require('../models/comment-model');
// const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');

const createComment = CatchAsync(async (req, res, next) => {
  req.body.createBy = req.currentUser._id;
  const newComment = await Comment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment,
    },
  });
});

const getAllComments = CatchAsync(async (req, res, next) => {
  const answerId = req.params.answerId;
  const c = await Comment.find({ commentFor: answerId });

  const comments = new APIFeatures(
    Comment.find().populate({
      path: 'createBy',
      select: ['userName', 'avatar'],
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await comments.query;
  const limit = Number(req.query.limit) || 10;
  const currentPage = Number(req.query.page) || 1;
  const totalPage = Math.ceil(c.length / limit);
  res.status(200).json({
    status: 'success',
    currentPage,
    totalPage,
    itemsPerPage: limit,
    data: [...result],
  });
});

const getCommentById = CatchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorHandler('No Comment found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

const updateComment = CatchAsync(async (req, res, next) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!comment) {
    return next(new ErrorHandler('No Comment found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

const deleteComment = CatchAsync(async (req, res, next) => {
  const comment = await Comment.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!comment) {
    return next(new ErrorHandler('No Comment found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
