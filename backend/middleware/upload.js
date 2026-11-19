const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { HttpError } = require('./helpers');

const dir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(dir, { recursive: true });
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + EXT[file.mimetype]),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Only JPG, PNG or WEBP images are allowed.'))),
});

// POST with a form field named "image" -> { url: "/uploads/xxxx.jpg" }
module.exports = (req, res, next) => upload.single('image')(req, res, (err) => {
  if (err) return next(err.code === 'LIMIT_FILE_SIZE' ? new HttpError(400, 'Image is too large (maximum 3 MB).') : err);
  if (!req.file) return next(new HttpError(400, 'Choose an image file.'));
  res.json({ url: '/uploads/' + req.file.filename });
});
