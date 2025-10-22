require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/Appointments');
const profileRoutes = require('./routes/profile');
const avatarRoutes = require('./routes/avatar');
const userRoutes = require('./routes/users');
const resetRoutes = require('./routes/reset');
const medicineRoutes = require('./routes/medicines');

require('./passport'); // Passport strategy config

const app = express();

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🛡️ Session (required for Passport login sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'MySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// 🔐 Passport
app.use(passport.initialize());
app.use(passport.session());

// 📁 Static file serving
app.use('/uploads', express.static('uploads'));

// 📦 Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profile', avatarRoutes); // avatar upload
app.use('/api/users', userRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/medicines', medicineRoutes);

// 🌍 MongoDB connection
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is missing. Check your .env file.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// 🧠 Runtime error logging
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB runtime error:', err.message);
});

const jwt = require('jsonwebtoken');

// 🔐 Google OAuth callback route
app.get('/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure'
  }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        console.error('❌ No user returned from Passport');
        return res.redirect('http://localhost:3000/oauth-failure');
      }

      console.log(`🔐 Logging in user ${user.email} with role: ${user.role}`); // ✅ now safe

      const validRoles = ['admin', 'patient', 'doctor', 'nurse'];
      if (!validRoles.includes(user.role)) {
        console.warn(`⚠️ Invalid role detected for user ${user.email}: ${user.role}`);
        return res.redirect('http://localhost:3000/oauth-failure');
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const redirectUrl = new URL('http://localhost:3000/oauth-success');
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('role', user.role);
      redirectUrl.searchParams.set('userId', user._id.toString());
      redirectUrl.searchParams.set('googleId', user.googleId);

      console.log('✅ Google login successful:', {
        email: user.email,
        role: user.role,
        redirect: redirectUrl.toString()
      });

      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('🔥 Google OAuth callback error:', err.message);
      res.redirect('http://localhost:3000/oauth-failure');
    }
  }
);


mongoose.set('debug', true);