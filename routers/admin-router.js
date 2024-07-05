const express = require('express');
const {
  getAllUsers,
  getUserById,
  deleteUser,
  createUser,
  approvePost,
  approveQuestion,
  disablePost
} = require('../controllers/user-controller');
const {
  checkAndVerifyToken,
  checkAdmin,
} = require('../controllers/auth-controller');

const {
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
} = require('../controllers/report-controller');

const {
  getAllFindMotelPosts,
  getAllPassItemPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/post-controller');

const adminRouter = express.Router();

adminRouter
  .get('/posts/motel', checkAndVerifyToken, checkAdmin, getAllFindMotelPosts)
  .get('/posts/pass-item', checkAndVerifyToken, checkAdmin, getAllPassItemPosts)
  .get('/get-users', checkAndVerifyToken, checkAdmin, getAllUsers)
  .get('/get-reports', checkAndVerifyToken, checkAdmin, getAllReports)
  .get('/get-user/:id', checkAndVerifyToken, checkAdmin, getUserById)
  .post('/add-user', checkAndVerifyToken, checkAdmin, createUser)
  .patch('/approve-post', checkAndVerifyToken, checkAdmin, approvePost)
  .patch('/approve-question', checkAndVerifyToken, checkAdmin, approveQuestion)
  .patch('/disable-post', checkAndVerifyToken, checkAdmin, disablePost)
  .delete('/delete-user/:id', checkAndVerifyToken, checkAdmin, deleteUser);

module.exports = adminRouter;
