require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');

// 📦 Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/users');
const resetRoutes = require('./routes/reset');
const medicineRoutes = require('./routes/medicines');
const notificationRoutes = require('./routes/notification');


require('./passport'); // Passport strategy config

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// ✅ Inject io into every request (so controllers can emit events)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🛡️ Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'MySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
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
app.use('/api/users', userRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ Notifications API

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
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB runtime error:', err.message);
});

mongoose.set('debug', true);

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

      if (user.isNewUser) {
        const signupUrl = new URL('http://localhost:3000/google-signup');
        signupUrl.searchParams.set('googleId', user.googleId);
        signupUrl.searchParams.set('email', user.email);
        signupUrl.searchParams.set('firstName', user.firstName);
        signupUrl.searchParams.set('lastName', user.lastName);
        return res.redirect(signupUrl.toString());
      }

      const validRoles = ['admin', 'patient', 'doctor', 'nurse'];
      if (!validRoles.includes(user.role)) {
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

      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('🔥 Google OAuth callback error:', err.message);
      res.redirect('http://localhost:3000/oauth-failure');
    }
  }
);

// 🧪 Debug route
const { auth } = require('./middleware/auth');
const User = require('./models/User');

app.get('/api/debug/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 📡 Socket.IO events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Example: join room by userId for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});