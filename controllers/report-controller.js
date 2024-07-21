const Report = require('../models/report-model');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../models/user-model');
const Noti = require('../models/notification-model');
const { startSession } = require('mongoose');

const createReport = CatchAsync(async (req, res, next) => {
  const session = await startSession();
  req.body.createBy = req.currentUser._id;
  session.withTransaction(async () => {
    const admin = await User.findOne({ role: 'admin' });
    const newReport = await Report.create([req.body], { session });
    const newNoti = await Noti.create(
      [
        {
          content: 'New report',
          notiFor: admin._id,
          category: 'report',
          report: newReport[0]._id,
        },
      ],
      { session }
    );
    res.status(201).json({
      status: 'success',
      data: {
        report: newReport,
      },
    });
  });
});
const getAllReports = CatchAsync(async (req, res, next) => {
  const reports = new APIFeatures(
    Report.find().populate({
      path: 'postReported',
      populate: {
        path: 'createBy',
        select: ['userName', 'avatar'],
      },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const result = await reports.query;
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      result,
    },
  });
});

const getReportById = CatchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new ErrorHandler('No Report found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report,
    },
  });
});

const updateReport = CatchAsync(async (req, res, next) => {
  const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!report) {
    return next(new ErrorHandler('No Report found!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      report,
    },
  });
});

const deleteReport = CatchAsync(async (req, res, next) => {
  const report = await Report.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!report) {
    return next(new ErrorHandler('No Report found!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
};
