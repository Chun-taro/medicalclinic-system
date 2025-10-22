const express = require('express');
const passport = require('passport');
const { signup, login } = require('../controllers/authController');
const { auth } = require('../middleware/auth'); // ✅ Fixed: destructure auth from the object

const router = express.Router();

// ✅ Local auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  res.json({ message: 'If your email is registered, a reset link has been sent.' });
});

// ✅ Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Add this route to validate tokens
router.get('/validate', auth, (req, res) => {
  res.json({
    valid: true,
    userId: req.user._id,
    role: req.user.role,
    email: req.user.email
  });
});

module.exports = router;