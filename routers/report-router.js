const express = require('express');

const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
} = require('../controllers/report-controller');

const { checkAndVerifyToken } = require('../controllers/auth-controller');

const reportRouter = express.Router();

reportRouter
  .post('/', checkAndVerifyToken, createReport)
  .get('/', getAllReports)
  .get('/:id', getReportById)
  .patch('/:id', checkAndVerifyToken, updateReport)
  .delete('/:id', checkAndVerifyToken, deleteReport);

module.exports = reportRouter;
