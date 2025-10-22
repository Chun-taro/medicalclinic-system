const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 📤 Send reset token to email
router.post('/send-token', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'michaelangeloangeles0@gmail.com',
        pass: 'lzwg hzev hkgo lver' // Gmail App Password
      }
    });

    await transporter.sendMail({
      to: email,
      subject: 'Your Password Reset Code',
      html: `<p>Your verification code is:</p><h2>${token}</h2><p>It expires in 10 minutes.</p>`
    });

    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error('❌ Send token error:', err);
    res.status(500).json({ error: 'Server error sending token' });
  }
});

// ✅ Verify token
router.post('/verify-token', async (req, res) => {
  const { email, token } = req.body;
  const user = await User.findOne({ email, resetToken: token });

  if (!user || user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  res.json({ message: 'Token verified' });
});

// 🔐 Reset password
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email, resetToken: token });

  if (!user || user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = router;