const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImages = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const allowedVideos = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];

  if (
    allowedImages.includes(file.mimetype) ||
    allowedVideos.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP images and MP4, MOV, WEBM videos are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 8,
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;