const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // ✅ Patient booking fields
  firstName: String,
lastName: String,
email: String,
phone: String,
address: String,
purpose: String,
appointmentDate: Date,

  // 🩺 Clinical and administrative fields
  date: Date,
  time: String,
  typeOfVisit: { type: String, enum: ['scheduled', 'walk-in', 'rescheduled'] },
  patientNo: String,
  dateOfBirth: Date,
  age: Number,
  nationality: String,
  ethnicity: String,
  religion: String,
  sex: String,
  contact: String,
  campus: { type: String, enum: ['main', 'satellite'] },
  courseAndYear: String,
  reasonForVisit: String,
  chiefComplaint: String,
  covidVaccinationStatus: String,
  allergies: String,
  requestedDate: Date,
  bloodPressure: String,
  temperature: String,
  oxygenSaturation: String,
  heartRate: String,
  bmi: String,
  bmiIntervention: String,
  diagnosis: String,
  management: String,
  medicinesPrescribed: String,
  availableInClinic: Boolean,
  quantity: Number,
  referredToPhysician: Boolean,
  physicianName: String,
  referredToExternalFaculty: Boolean,
  timeReferred: String,
  referredWithin1Hour: { type: String, enum: ['y', 'n'] },
  firstAidDone: { type: String, enum: ['y', 'n'] },
  firstAidWithin30Mins: { type: String, enum: ['y', 'n', 'n/a'] }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);