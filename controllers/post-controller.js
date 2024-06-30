const Post = require('../models/post-model');
const User = require('../models/user-model');
const Noti = require('../models/notification-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const { startSession } = require('mongoose');

const createPost = CatchAsync(async (req, res, next) => {
  const session = await startSession();
  req.body.createBy = req.currentUser._id;
  session.withTransaction(async () => {
    const admin = await User.findOne({ role: 'admin' });
    const newPost = await Post.create([req.body], { session });
    console.log(newPost[0]._id);
    const newNoti = await Noti.create(
      [
        {
          content: 'User request to create new post',
          notiFor: admin._id,
          category: 'request-create-post',
          idLink: newPost[0]._id,
        },
      ],
      { session }
    );
    res.status(201).json({
      status: 'success',
      data: {
        post: newPost,
      },
    });
  });
});

const getAllPosts = CatchAsync(async (req, res, next) => {
  // let filter = {};
  if(!req?.currentUser || req?.currentUser?.role  !== 'admin') req.query.status = 'active';
  let search = req.query.search || '';
  const posts = new APIFeatures(
    Post.find({ title: { $regex: search, $options: 'i' } }).populate({
      path: 'createBy',
      select: ['userName', 'avatar'],
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await posts.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getPostById = CatchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler('No Post found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

const updatePost = CatchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return next(new ErrorHandler('No Post found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

const deletePost = CatchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return next(new ErrorHandler('No Post found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
