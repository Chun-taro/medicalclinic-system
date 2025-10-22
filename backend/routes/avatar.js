const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

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
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const imagePath = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { avatar: imagePath });
    res.json({ message: 'Avatar updated', avatar: imagePath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;