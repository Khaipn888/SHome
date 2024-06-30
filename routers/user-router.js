const express = require('express');
const {
  updateUser,
  getMe,
  updateMe,
  getMyPosts,
  savePost,
  unsavePost,
  vote,
  unVote,
} = require('../controllers/user-controller');
const {
  login,
  register,
  checkAndVerifyToken,
  updatePassword,
} = require('../controllers/auth-controller');

const {
  createReport
} = require('../controllers/report-controller');

const userRouter = express.Router();

userRouter
  .get('/myself/:id', checkAndVerifyToken, getMe)
  .get('/my-posts/:id', checkAndVerifyToken, getMyPosts)
  .post('/vote', checkAndVerifyToken, vote)
  .post('/unvote', checkAndVerifyToken, unVote)
  .post('/report', checkAndVerifyToken, createReport)
  .patch('/myself/:id', checkAndVerifyToken, updateMe)
  .patch('/change-password', checkAndVerifyToken, updatePassword)
  .patch('/save-post', checkAndVerifyToken, savePost)
  .patch('/unsave-post', checkAndVerifyToken, unsavePost)
  .patch('/:id', checkAndVerifyToken, updateUser);

module.exports = userRouter;
