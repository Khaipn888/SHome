const userRouter = require('./user-router');
const adminRouter = require('./admin-router');
const postRouter = require('./post-router');
const authRouter = require('./auth-router');
const answerRouter = require('./answer-router');
const questionRouter = require('./question-router');
const commentRouter = require('./comment-router');
const HandleError = require('../utils/ErrorHandler');
const errorController = require('../controllers/error-controller');

const initRouter = (app) => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/questions', questionRouter);
  app.use('/api/answers', answerRouter);
  app.use('/api/comments', commentRouter);

  // app.all('*', (req, res, next) => {
  //   next(new HandleError(`Can't find ${req.originalUrl} on this server`), 404);
  // });

  app.use(errorController);

  return app.get('/', (req, res) => {
    res.status(200).json('hello');
  });
};

module.exports = initRouter;
