const express = require('express');
// const multer = require('multer');
const {
  createPost,
  getAllFindMotelPosts,
  getAllPassItemPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/post-controller');

const { checkAndVerifyToken } = require('../controllers/auth-controller');

const postRouter = express.Router();
// const upload = multer({
//   storage: multer.memoryStorage(),
// });
postRouter
.get('/motel', getAllFindMotelPosts)
.get('/pass-item', getAllPassItemPosts)
  .post('/', checkAndVerifyToken, createPost)
  .get('/:id', getPostById)
  .patch('/:id', checkAndVerifyToken, updatePost)
  .delete('/:id', checkAndVerifyToken, deletePost);

module.exports = postRouter;
