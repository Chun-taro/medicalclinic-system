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
  updateAppointment,
  saveConsultation
} = require('../controllers/appointmentController');

const { auth } = require('../middleware/auth');

const router = express.Router();

//  Booking and patient routes
router.post('/book', auth, bookAppointment);
router.get('/patient/:patientId', auth, getPatientAppointments);
router.get('/my', auth, getMyAppointments);
router.patch('/:id', auth, updateAppointment);

//  Admin routes
router.get('/', auth, getAllAppointments);
router.delete('/:id', auth, deleteAppointment);
router.patch('/:id', auth, updateAppointment); 
router.patch('/:id/approve', auth, approveAppointment);
 

//  Consultation routes
router.patch('/:id/start', auth, startConsultation);
router.patch('/:id/complete', auth, completeConsultation);
router.patch('/:id/consultation', auth, saveConsultation);

//  Reporting and analytics
router.get('/reports', auth, generateReports);
router.get('/consultations', auth, getConsultations);
router.get('/consultations/:id', auth, getConsultationById);

module.exports = router;