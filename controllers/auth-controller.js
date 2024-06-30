const User = require('../models/user-model');
const ErrorHandler = require('../utils/ErrorHandler');
const CatchAsync = require('../utils/CatchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const SENDMAIL = require('../utils/send-email.js');
const passport = require('passport');

// const createAccessToken = (id, role) => {
//   return jwt.sign(
//     { id: id, role: role, type: 'access-token' },
//     process.env.ACCESS_TOKEN_SECRET_KEY,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRED,
//     }
//   );
// };

// const createRefreshToken = (id, role) => {
//   return jwt.sign(
//     { id: id, role: role },
//     process.env.REFRESH_TOKEN_SECRET_KEY,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRED,
//     }
//   );
// };

const generateToken = (id, role) => {
  const accessToken = jwt.sign(
    { id: id, role: role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRED,
    }
  );
  return { accessToken };
};

const sendTokenViaCookie = (res, { accessToken }) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: false,
  };
  res.cookie('AT', accessToken, cookieOptions);
};

const register = CatchAsync(async (req, res, next) => {
  const { userName, email } = req.body;
  const user = await User.findOne({ email: email });
  if (user) return next(new ErrorHandler('The Email was registered.', 400));
  await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: { userName, email },
    },
  });
});

const login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new ErrorHandler('Missing Email or Password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    next(new ErrorHandler('Email not existed', 404));
  }
  const isCorrectPassword = await user.correctPassword(password, user.password);
  if (isCorrectPassword) {
    const { accessToken } = generateToken(user._id, user.role);
    sendTokenViaCookie(res, { accessToken });
    if (req.account === 'google') next();
    res.status(201).json({
      status: 'success',
      accessToken,
      id: user._id,
      name: user.userName,
      avatar: user.avatar,
      role: user.role,
    });
  } else return next(new ErrorHandler('Password incorrect', 404));
});

const checkAndVerifyToken = CatchAsync(async (req, res, next) => {
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    accessToken = req.headers.authorization.split(' ')[1];
  }
  if (!accessToken)
    return next(new ErrorHandler('You are not logged in!', 401));

  const decodeAT = await promisify(jwt.verify)(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET_KEY
  );
  const currentUser = await User.findOne({ _id: decodeAT.id });
  if (!currentUser)
    return next(new ErrorHandler('Access Token do not match any users', 401));

  if (currentUser.changedPasswordAfter(decodeAT.iat))
    return next(
      new ErrorHandler(
        'User recently change password! Please log in again.',
        401
      )
    );
  req.currentUser = currentUser;
  next();
});

const checkAdmin = CatchAsync(async (req, res, next) => {
  if (!(req.currentUser.role === 'admin'))
    return next(new ErrorHandler('You do not have permission', 403));
  next();
});

const updatePassword = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordConfirm, user.password)))
    return next(new ErrorHandler('Your current password is wrong.', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  sendTokenViaCookie(res, createToken(user._id));
  res.status(200).json({
    status: 'success',
  });
});

const googleLogin = CatchAsync(async (req, res, next) => {
  passport.authenticate('google', async (err, profile) => {
    const { email } = profile;
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = await User.create(profile);
    }
    req.account = 'google';
    req.body = profile;
    next();
  })(req, res, next);
});

module.exports = {
  register,
  login,
  checkAndVerifyToken,
  checkAdmin,
  updatePassword,
  googleLogin,
};
