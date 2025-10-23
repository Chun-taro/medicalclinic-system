const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const { uploadAvatar } = require('../controllers/profileController');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/profile/avatar
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;