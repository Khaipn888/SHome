const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file) cb(null, '../public/upload');
  },
  filename: function (req, file, cb) {
    const new_filename = Date.now() + file.originalname;
    cb(null, new_filename);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.minetype === 'image/jpeg' || file.minetype === 'image/png') {
    cb(null, true);
  } else {
    cb({ message: 'Unsuposted file format' }, false);
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  //   fileFilter: fileFilter,
});
module.exports = upload;
