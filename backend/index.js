require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/Appointments'); // ✅ declared once
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/users');
const resetRoutes = require('./routes/reset');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes); // ✅ used once
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reset-password', resetRoutes); // ✅ moved up for consistency

const medicineRoutes = require('./routes/medicines');
app.use('/api/medicines', medicineRoutes);

// MongoDB connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI is missing. Check your .env file.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB and start server
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

// Runtime error logging
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB runtime error:', err.message);
});
mongoose.set('debug', true);