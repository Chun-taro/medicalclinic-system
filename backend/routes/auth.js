const express = require('express');
const passport = require('passport');
const { signup, login, validateToken, googleSignup } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ✅ Local auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google-signup', googleSignup);
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  res.json({ message: 'If your email is registered, a reset link has been sent.' });
});

// ✅ Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Token validation route
router.get('/validate', auth, validateToken);

module.exports = router;