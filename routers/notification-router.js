const express = require('express');

const {
  checkAndVerifyToken,
  checkAdmin,
} = require('../controllers/auth-controller');

const {
  getNotifications,
  readNoti,
} = require('../controllers/noti-controller');

const notiRouter = express.Router();

notiRouter
  .get('/:id', checkAndVerifyToken, getNotifications)
  .patch('/:id', checkAndVerifyToken, readNoti);

module.exports = notiRouter;
