const authRouter = require('express').Router();
const passport = require('passport');
const {
  googleLogin,
  login,
  register,
} = require('../controllers/auth-controller');
const {
  resetPassWord,
  forgotPassword,
} = require('../controllers/user-controller');

authRouter.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: 'Successfully Loged In',
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: 'Not Authorized' });
  }
});

authRouter.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Log in failure',
  });
});

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

authRouter.get('/google/callback', googleLogin, login, (req, res, next) => {
  res.redirect('http://localhost:8080');
});

authRouter
  .post('/login', login)
  .post('/register', register)
  .post('/forgot-password', forgotPassword)
  .patch('/reset-password', resetPassWord);

authRouter.get('/logout', (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = authRouter;
