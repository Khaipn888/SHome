const express = require('express');

const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question-controller');
const { checkAndVerifyToken } = require('../controllers/auth-controller');

const questionRouter = express.Router();

questionRouter
  .post('/', checkAndVerifyToken, createQuestion)
  .get('/', getAllQuestions)
  .get('/:id', getQuestionById)
  .patch('/:id', checkAndVerifyToken, updateQuestion)
  .delete('/:id', checkAndVerifyToken, deleteQuestion);

module.exports = questionRouter;
