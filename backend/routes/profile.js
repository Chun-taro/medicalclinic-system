const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

// GET profile of logged-in user
router.get('/', auth, getProfile);

// PUT update profile of logged-in user
router.put('/', auth, updateProfile);

module.exports = router;