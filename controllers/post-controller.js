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

const getAllFindMotelPosts = CatchAsync(async (req, res, next) => {
  if (!req?.currentUser || req?.currentUser?.role !== 'admin')
    req.query.status = 'active';
  let search = req.query.search || '';
  let min_price = Number(req?.query?.min_price) || 0;
  let max_price = Number(req?.query?.max_price) || 50000000;
  let min_area = Number(req?.query?.min_area) || 0;
  let max_area = Number(req?.query?.max_area) || 500;

  const posts = new APIFeatures(
    Post.find({
      title: { $regex: search, $options: 'i' },
      category: { $ne: 'pass-do' },
      price: { $gte: min_price, $lte: max_price },
      area: { $gte: min_area, $lte: max_area },
    }).populate({
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

const getAllPassItemPosts = CatchAsync(async (req, res, next) => {
  if (!req?.currentUser || req?.currentUser?.role !== 'admin')
    req.query.status = 'active';
  let search = req.query.search || '';
  const posts = new APIFeatures(
    Post.find({
      title: { $regex: search, $options: 'i' },
      category: 'pass-do',
    }).populate({
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
  getAllFindMotelPosts,
  getAllPassItemPosts,
  getPostById,
  updatePost,
  deletePost,
};
