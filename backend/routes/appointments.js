const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  bookAppointment,
  getPatientAppointments,
  getAllAppointments,
  deleteAppointment,
  approveAppointment,
  getMyAppointments,
  startConsultation,
  completeConsultation,
  generateReports,
  getConsultations,
  getConsultationById
} = require('../controllers/appointmentController');

// Book appointment
router.post('/book', auth, bookAppointment);

// Get appointments for patient
router.get('/patient/:patientId', auth, getPatientAppointments);

// Admin: get all appointments
router.get('/', auth, getAllAppointments);

// Delete appointment
router.delete('/:id', auth, deleteAppointment);

// Approve appointment
router.patch('/:id/approve', auth, approveAppointment);

// Get current patient's appointments
router.get('/my', auth, getMyAppointments);

// Start consultation
router.post('/:id/start-consultation', auth, startConsultation);

// Complete consultation
router.patch('/:id/consultation', auth, completeConsultation);

// Reports
router.get('/reports', auth, generateReports);

// Consultations
router.get('/consultations', getConsultations);

// Get consultation by ID
router.get('/consultation/:id', getConsultationById);

module.exports = router;