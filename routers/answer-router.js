const express = require('express');

const {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
} = require('../controllers/answer-controller');
const { checkAndVerifyToken } = require('../controllers/auth-controller');

const answerRouter = express.Router();

answerRouter
  .post('/', checkAndVerifyToken, createAnswer)
  .get('/', getAllAnswers)
  .get('/:id', getAnswerById)
  .patch('/:id', checkAndVerifyToken, updateAnswer)
  .delete('/:id', checkAndVerifyToken, deleteAnswer);

module.exports = answerRouter;
