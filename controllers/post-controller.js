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
          post: newPost[0]._id,
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
  let status = ['pending', 'active', 'disable'];
  if (!req?.currentUser || req?.currentUser?.role !== 'admin') {
    status = ['active'];
  }
  if (req?.currentUser?.role !== 'admin' && req.query?.status) {
    status = [req.query.status];
  }
  let search = req.query.search || '';
  let category = ['cho-thue-tro', 'o-ghep'];
  if (req.query?.category) {
    if (req.query.category === 'pass-do') {
      category = [''];
    } else {
      category = [req.query.category];
    }
  }
  let min_price = Number(req?.query?.min_price) || 0;
  let max_price = Number(req?.query?.max_price) || 50000000;
  let min_area = Number(req?.query?.min_area) || 0;
  let max_area = Number(req?.query?.max_area) || 500;
  let province = req?.query?.province || '';
  let district = req?.query?.district || '';
  let ward = req?.query?.ward || '';

  const p = await Post.find({
    title: { $regex: search, $options: 'i' },
    price: { $gte: min_price, $lte: max_price },
    area: { $gte: min_area, $lte: max_area },
    status: { $in: status },
    province: { $regex: province, $options: 'i' },
    district: { $regex: district, $options: 'i' },
    ward: { $regex: ward, $options: 'i' },
    category: { $in: category },
  });
  const posts = new APIFeatures(
    Post.find({
      title: { $regex: search, $options: 'i' },
      category: { $ne: 'pass-do' },
      price: { $gte: min_price, $lte: max_price },
      area: { $gte: min_area, $lte: max_area },
      status: { $in: status },
      province: { $regex: province, $options: 'i' },
      district: { $regex: district, $options: 'i' },
      ward: { $regex: ward, $options: 'i' },
      category: { $in: category },
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
  const limit = Number(req.query.limit) || 10;
  const currentPage = Number(req.query.page) || 1;
  const totalPage = Math.ceil(p.length / limit);
  res.status(200).json({
    status: 'success',
    currentPage,
    totalPage,
    itemsPerPage: limit,
    data: [...result],
  });
});

const getAllPassItemPosts = CatchAsync(async (req, res, next) => {
  let status = ['active', 'pending', 'disable'];
  if (!req?.currentUser || req?.currentUser?.role !== 'admin') {
    status = ['active'];
  }
  if (req?.currentUser?.role !== 'admin' && req.query?.status) {
    status = [req.query.status];
  }

  let search = req.query.search || '';

  const p = await Post.find({
    title: { $regex: search, $options: 'i' },
    category: 'pass-do',
    status: { $in: status },
  });
  const posts = new APIFeatures(
    Post.find({
      title: { $regex: search, $options: 'i' },
      category: 'pass-do',
      status: { $in: status },
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
  const limit = Number(req.query.limit) || 10;
  const currentPage = Number(req.query.page) || 1;
  const totalPage = Math.ceil(p.length / limit);
  res.status(200).json({
    status: 'success',
    currentPage,
    totalPage,
    itemsPerPage: limit,
    data: [...result],
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
