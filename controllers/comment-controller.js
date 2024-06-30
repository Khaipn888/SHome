const Comment = require('../models/comment-model');
// const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');

const createComment = CatchAsync(async (req, res, next) => {
  const newComment = await Comment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment,
    },
  });
});

const getAllComments = CatchAsync(async (req, res, next) => {
  
  const comments = await Comment.find();
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments,
    },
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
