const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set your destination folder
    cb(null, "media/");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      console.log(file, "Hello")
      file.filename = file.originalname
      const filename = buf.toString("hex") + path.extname(file.originalname);
      cb(null, filename);
    });
  },
});

// Initialize multer with your storage options

module.exports.upload = multer({ storage: storage });
