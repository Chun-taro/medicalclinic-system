const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Add reCAPTCHA verification function
const verifyRecaptcha = async (token) => {
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    });
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

const signup = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      middleName,
      email, 
      password, 
      role, 
      recaptchaToken,
      idNumber,
      sex,
      civilStatus,
      birthday,
      age,
      homeAddress,
      contactNumber,
      emergencyContact,
      bloodType,
      allergies,
      medicalHistory,
      currentMedications,
      familyHistory
    } = req.body;

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if ID number already exists
    if (idNumber) {
      const existingId = await User.findOne({ idNumber });
      if (existingId) {
        return res.status(400).json({ error: 'ID Number already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      middleName,
      email,
      password: hashedPassword,
      role: role || 'patient',
      idNumber,
      sex,
      civilStatus,
      birthday,
      age,
      homeAddress,
      contactNumber,
      emergencyContact,
      bloodType,
      allergies: allergies || [],
      medicalHistory: medicalHistory || [],
      currentMedications: currentMedications || [],
      familyHistory: familyHistory || {}
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Token validation function
const validateToken = async (req, res) => {
  res.json({
    valid: true,
    userId: req.user._id,
    role: req.user.role,
    email: req.user.email
  });
};

// Google signup completion
const googleSignup = async (req, res) => {
  try {
    const { 
      googleId,
      email,
      firstName,
      lastName,
      middleName,
      recaptchaToken,
      idNumber,
      sex,
      civilStatus,
      birthday,
      age,
      homeAddress,
      contactNumber,
      emergencyContact,
      bloodType,
      allergies,
      medicalHistory,
      currentMedications,
      familyHistory
    } = req.body;

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Check if user with this Google ID already exists
    const existingUser = await User.findOne({ googleId });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this Google account' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if ID number already exists
    if (idNumber) {
      const existingId = await User.findOne({ idNumber });
      if (existingId) {
        return res.status(400).json({ error: 'ID Number already exists' });
      }
    }

    const user = new User({
      googleId,
      email,
      firstName,
      lastName,
      middleName,
      password: 'google-oauth', // Placeholder password for Google users
      role: 'patient',
      idNumber,
      sex,
      civilStatus,
      birthday,
      age,
      homeAddress,
      contactNumber,
      emergencyContact,
      bloodType,
      allergies: allergies || [],
      medicalHistory: medicalHistory || [],
      currentMedications: currentMedications || [],
      familyHistory: familyHistory || {}
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role,
      googleId: user.googleId,
      message: 'Google signup completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  signup, 
  login, 
  validateToken,
  googleSignup
};