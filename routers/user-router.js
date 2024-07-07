const express = require('express');
const {
  updateUser,
  getMe,
  updateMe,
  getMyPosts,
  savePost,
  unsavePost,
  saveQuestion,
  unsaveQuestion,
  vote,
  unVote,
  getMyPostsSaved,
} = require('../controllers/user-controller');
const {
  login,
  register,
  checkAndVerifyToken,
  updatePassword,
} = require('../controllers/auth-controller');

const { createReport } = require('../controllers/report-controller');

const userRouter = express.Router();

userRouter
  .get('/myself/:id', checkAndVerifyToken, getMe)
  .get('/my-posts/:id', checkAndVerifyToken, getMyPosts)
  .get('/my-posts-saved/:id', checkAndVerifyToken, getMyPostsSaved)
  .post('/vote', checkAndVerifyToken, vote)
  .post('/unvote', checkAndVerifyToken, unVote)
  .post('/report', checkAndVerifyToken, createReport)
  .patch('/myself/:id', checkAndVerifyToken, updateMe)
  .patch('/change-password', checkAndVerifyToken, updatePassword)
  .patch('/save-post', checkAndVerifyToken, savePost)
  .patch('/unsave-post', checkAndVerifyToken, unsavePost)
  .patch('/save-question', checkAndVerifyToken, saveQuestion)
  .patch('/unsave-question', checkAndVerifyToken, unsaveQuestion)
  .patch('/:id', checkAndVerifyToken, updateUser);

module.exports = userRouter;
