const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 🧑 Personal Info
  firstName: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    trim: true
  },
  lastName: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    trim: true
  },
  middleName: { type: String, trim: true },
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  civilStatus: {
    type: String,
    enum: ['single', 'married', 'widowed', 'divorced'],
    default: 'single'
  },
  birthday: { type: Date },
  homeAddress: { type: String, trim: true },
  contactNumber: { type: String, trim: true },

  // 📧 Login Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: { type: String },

  // 🛡️ Role
  role: {
    type: String,
    enum: ['patient', 'admin', 'doctor', 'nurse'],
    default: 'patient'
  },

  // 🔐 Password Reset
  resetToken: String,
  resetTokenExpiry: Date,

  // 🖼️ Profile Picture
  avatar: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);