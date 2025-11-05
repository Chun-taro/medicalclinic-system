const express = require('express');
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
  getConsultationById,
  updateAppointment // ✅ Add this to your controller exports
} = require('../controllers/appointmentController');

const { auth } = require('../middleware/auth');

const router = express.Router();

// 📅 Booking and patient routes
router.post('/book', auth, bookAppointment);
router.get('/patient/:patientId', auth, getPatientAppointments);
router.get('/my', auth, getMyAppointments);
router.patch('/:id', auth, updateAppointment);

// 🛠 Admin routes
router.get('/', auth, getAllAppointments);
router.delete('/:id', auth, deleteAppointment);
router.patch('/:id', auth, updateAppointment); // ✅ NEW: Edit/reschedule appointment
router.patch('/:id/approve', auth, approveAppointment);

// 🩺 Consultation routes
router.patch('/:id/start', auth, startConsultation);
router.patch('/:id/complete', auth, completeConsultation);

// 📊 Reporting and analytics
router.get('/reports', auth, generateReports);
router.get('/consultations', auth, getConsultations);
router.get('/consultations/:id', auth, getConsultationById);

module.exports = router;