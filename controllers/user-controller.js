const User = require('../models/user-model');
const Post = require('../models/post-model');
const Vote = require('../models/vote-model');
const Noti = require('../models/notification-model');
const Question = require('../models/question-model');
const Answer = require('../models/answer-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const sendEmail = require('../utils/send-email');
const crypto = require('crypto');
const { startSession } = require('mongoose');

const createUser = CatchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

const getAllUsers = CatchAsync(async (req, res, next) => {
  req.query.role = 'user';
  const users = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const result = await users.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getUserById = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler('No user found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const getMe = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  res.status(200).json({
    status: 'success',
    data: {
      user: req.currentUser,
    },
  });
});

const getMyPosts = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  let search = req.query.search || '';
  const posts = new APIFeatures(
    Post.find({ title: { $regex: search, $options: 'i' }, createBy: userId }),
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

const updateMe = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  const user = await User.findByIdAndUpdate(req.currentUser._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

const getMyPostsSaved = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  const postsSaved = req.currentUser.postSaved;

  const posts = new APIFeatures(
    Post.find({ _id: { $in: postsSaved } }),
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

const getMyQuestionsSaved = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));
  const questionsSaved = req.currentUser.questionSaved;

  const questions = new APIFeatures(
    Question.find({ _id: { $in: questionsSaved } }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await questions.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getMyNotifications = CatchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.currentUser._id.toString())
    return next(new ErrorHandler('You do not have permission', 403));

  const notifications = new APIFeatures(
    Noti.find({ notiFor: userId }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await notifications.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});



const savePost = CatchAsync(async (req, res, next) => {
  if (req.currentUser.postSaved.indexOf(req.body.postId) !== -1)
    return next(new ErrorHandler('Post has been saved', 400));
  req.currentUser.postSaved.push(req.body.postId);
  const user = await User.findByIdAndUpdate(
    req.currentUser._id,
    { postSaved: req.currentUser.postSaved },
    {
      new: true,
      runValidators: true,
    }
  );
  if(!user) return next(new ErrorHandler('Question not found', 404));
  res.status(200).json({
    status: 'success',
  });
});

const unsavePost = CatchAsync(async (req, res, next) => {
  if (req.currentUser.postSaved.indexOf(req.body.postId) === -1)
    return next(new ErrorHandler('Post not saved', 400));

  req.currentUser.postSaved = req.currentUser.postSaved.filter(
    (item) => item !== req.body.postId
  );
  const user = await User.findByIdAndUpdate(
    req.currentUser._id,
    { postSaved: req.currentUser.postSaved },
    {
      new: true,
      runValidators: true,
    }
  );
  if(!user) return next(new ErrorHandler('Post not found', 404));
  res.status(200).json({
    status: 'success',
  });
});

const saveQuestion = CatchAsync(async (req, res, next) => {
  if (req.currentUser.questionSaved.indexOf(req.body.questionId) !== -1)
    return next(new ErrorHandler('Question has been saved', 400));
  req.currentUser.questionSaved.push(req.body.questionId);
  const user = await User.findByIdAndUpdate(
    req.currentUser._id,
    { questionSaved: req.currentUser.questionSaved },
    {
      new: true,
      runValidators: true,
    }
  );
  if(!user) return next(new ErrorHandler('Post not found', 404));
  res.status(200).json({
    status: 'success',
  });
});

const unsaveQuestion = CatchAsync(async (req, res, next) => {
  if (req.currentUser.questionSaved.indexOf(req.body.questionId) === -1)
    return next(new ErrorHandler('question not saved', 400));

  req.currentUser.questionSaved = req.currentUser.questionSaved.filter(
    (item) => item !== req.body.questionId
  );
  const user = await User.findByIdAndUpdate(
    req.currentUser._id,
    { questionSaved: req.currentUser.questionSaved },
    {
      new: true,
      runValidators: true,
    }
  );
  if(!user) return next(new ErrorHandler('Question not found', 404));
  res.status(200).json({
    status: 'success',
  });
});

const updateUser = CatchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ErrorHandler('No user found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const deleteUser = CatchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ErrorHandler('No user found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const forgotPassword = CatchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  if (!email) return next(new ErrorHandler('Missing email', 400));
  const user = await User.findOne({ email: email });
  if (!user) return next(new ErrorHandler('Email not existed', 404));
  const passwordResetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const html = `Click vào <a href='${process.env.CLIENT_URL}/reset-password/${passwordResetToken}'>đây</a> để tạo mật khẩu mới.<br>Link này sẽ mất hiệu lực sau 5 phút kể từ bây giờ.`;
  const result = await sendEmail(email, html);
  // console.log(result);
  res.status(200).json({
    status: 'success',
    result,
  });
});

const resetPassWord = CatchAsync(async (req, res, next) => {
  console.log(req.body);
  const { resetToken, password, passwordConfirm } = req.body;
  if (!resetToken || !password || !passwordConfirm)
    return next(new ErrorHandler('Missing input', 400));
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(new ErrorHandler('Token is invalid or has expired', 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

const vote = CatchAsync(async (req, res, next) => {
  const voteBy = req.currentUser._id;
  const { category, voteFor } = req.body;
  if (!category || !voteFor)
    return next(new ErrorHandler('Missing input', 400));
  const session = await startSession();

  const vote = await Vote.findOne({ voteBy, category, voteFor });
  if (vote) return next(new ErrorHandler('You have voted', 400));
  session.withTransaction(async () => {
    const newVote = await Vote.create([{ voteBy, category, voteFor }], {
      session,
    });
    if (category === 'question') {
      await Question.findOneAndUpdate(
        { _id: voteFor },
        { $inc: { vote: +1 } },
        { session }
      );
    }
    if (category === 'answer') {
      await Answer.findOneAndUpdate(
        { _id: voteFor },
        { $inc: { vote: +1 } },
        { session }
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        newVote,
      },
    });
  });
});

const unVote = CatchAsync(async (req, res, next) => {
  const voteBy = req.currentUser._id;
  const { category, voteFor } = req.body;
  if (!category || !voteFor)
    return next(new ErrorHandler('Missing input', 400));
  const session = await startSession();

  const vote = await Vote.findOne({ voteBy, category, voteFor });
  if (!vote) return next(new ErrorHandler(`You have't voted yet`, 400));
  session.withTransaction(async () => {
    const newVote = await Vote.findOneAndDelete([{ _id: vote._id }], {
      session,
    });
    if (category === 'question') {
      await Question.findOneAndUpdate(
        { _id: voteFor },
        { $inc: { vote: -1 } },
        { session }
      );
    }
    if (category === 'answer') {
      await Answer.findOneAndUpdate(
        { _id: voteFor },
        { $inc: { vote: -1 } },
        { session }
      );
    }
    res.status(201).json({
      status: 'success',
    });
  });
});

const approvePost = CatchAsync(async (req, res, next) => {
  const { postId, action, userId } = req.body;
  if (!postId || !action || !userId)
    return next(new ErrorHandler('Missing input', 400));
  const session = await startSession();
  session.withTransaction(async () => {
    let newNoti;
    if (action === 'pass') {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { status: 'active' },
        {
          session,
        }
      );
      if (!post) return next(new ErrorHandler('Post not found', 404));

      newNoti = await Noti.create(
        [
          {
            content: 'Your post has been approved',
            notiFor: userId,
            category: 'approve',
            idLink: post._id,
          },
        ],
        { session }
      );
    }
    if (action === 'not-pass') {
      newNoti = await Noti.create([
        {
          content: 'Your post has not been approved',
          notiFor: userId,
          category: 'not-approve',
          idLink: postId,
        },
      ]);
    }
    res.status(201).json({
      status: 'success',
      data: {
        newNoti,
      },
    });
  });
});

const approveQuestion = CatchAsync(async (req, res, next) => {
  const { questionId, action, userId } = req.body;
  if (!questionId || !action || !userId)
    return next(new ErrorHandler('Missing input', 400));
  const session = await startSession();
  session.withTransaction(async () => {
    let newNoti;
    if (action === 'pass') {
      const question = await Question.findOneAndUpdate(
        { _id: questionId },
        { status: 'active' },
        {
          session,
        }
      );
      if (!question) return next(new ErrorHandler('question not found', 404));

      newNoti = await Noti.create(
        [
          {
            content: 'Your question has been approved',
            notiFor: userId,
            category: 'approve',
            idLink: question._id,
          },
        ],
        { session }
      );
    }
    if (action === 'not-pass') {
      newNoti = await Noti.create([
        {
          content: 'Your question has not been approved',
          notiFor: userId,
          category: 'not-approve',
          idLink: questionId,
        },
      ]);
    }
    res.status(201).json({
      status: 'success',
      data: {
        newNoti,
      },
    });
  });
});

const disablePost = CatchAsync(async (req, res, next) => {
  const { postId } = req.body;
  if (!postId) return next(new ErrorHandler('Missing input', 400));
  const session = await startSession();
  session.withTransaction(async () => {
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { status: 'disable' },
      {
        session,
      }
    );
    if (!post) return next(new ErrorHandler('Post not found', 404));

    const newNoti = await Noti.create(
      [
        {
          content: 'Your post has been disable',
          notiFor: post.createBy,
          category: 'disable-post',
          idLink: post._id,
        },
      ],
      { session }
    );

    res.status(200).json({
      status: 'success',
      data: {
        newNoti,
      },
    });
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  savePost,
  unsavePost,
  forgotPassword,
  resetPassWord,
  vote,
  unVote,
  approvePost,
  approveQuestion,
  disablePost,
  getMyPosts,
  getMyPostsSaved,
  saveQuestion,
  unsaveQuestion,
};
