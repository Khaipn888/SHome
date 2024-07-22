const express = require('express');

const {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require('../controllers/comment-controller');
const { checkAndVerifyToken } = require('../controllers/auth-controller');

const commentRouter = express.Router();

commentRouter
  .post('/', checkAndVerifyToken, createComment)
  .get('/:answerId', getAllComments)
  .get('/:id', getCommentById)
  .patch('/:id', checkAndVerifyToken, updateComment)
  .delete('/:id', checkAndVerifyToken, deleteComment);

module.exports = commentRouter;
