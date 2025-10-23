const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllUsers, updateUserRole, getRoleByGoogleId } = require('../controllers/userController');

// 🔍 GET all users (admin only)
router.get('/', auth, getAllUsers);

// 🔧 PUT: update user role (admin only)
router.put('/:id/role', auth, updateUserRole);

// 🔍 GET role by Google ID
router.get('/role-by-google/:googleId', getRoleByGoogleId);

module.exports = router;