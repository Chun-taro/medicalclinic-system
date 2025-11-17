const User = require('../models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Local signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'patient'
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Signup successful', token, userId: newUser._id, role: newUser.role });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Local login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token, userId: user._id, role: user.role });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Token validation
const validateToken = async (req, res) => {
  res.json({ valid: true });
};

// Google signup
const googleSignup = async (req, res) => {
  try {
    const {
      googleId, firstName, lastName, middleName, email, password, role,
      idNumber, sex, civilStatus, birthday, age, homeAddress, contactNumber,
      emergencyContact, bloodType, allergies, medicalHistory, currentMedications,
      familyHistory, recaptchaToken
    } = req.body;

    // Verify reCAPTCHA
    const recaptchaRes = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: recaptchaToken
        }
      }
    );

    if (!recaptchaRes.data.success) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      googleId, firstName, lastName, middleName, email, password: hashedPassword, role,
      idNumber, sex, civilStatus, birthday, age, homeAddress, contactNumber,
      emergencyContact, bloodType, allergies, medicalHistory, currentMedications, familyHistory
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Signup successful',
      token,
      userId: newUser._id,
      role: newUser.role,
      googleId: newUser.googleId
    });
  } catch (err) {
    console.error('Google signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
};

module.exports = {
  signup,
  login,
  validateToken,
  googleSignup
};