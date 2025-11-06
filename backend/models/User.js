const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  //  Personal Info
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
  
  // Identification
  idNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  
  //  Demographics
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
  age: { type: Number },
  
  //  Contact Information
  homeAddress: { type: String, trim: true },
  contactNumber: { type: String, trim: true },
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  
  //  Medical Information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  allergies: [{ type: String, trim: true }],
  medicalHistory: [{ type: String, trim: true }],
  currentMedications: [{ type: String, trim: true }],
  
  //  Family History
  familyHistory: {
    diabetes: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    heartDisease: { type: Boolean, default: false },
    cancer: { type: Boolean, default: false },
    other: { type: String, trim: true }
  },

  //  Login Info
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

  //  Role
  role: {
    type: String,
    enum: ['patient', 'admin', 'doctor', 'nurse'],
    default: 'patient'
  },

  //  Password Reset
  resetToken: String,
  resetTokenExpiry: Date,

  //  Profile Picture
  avatar: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);