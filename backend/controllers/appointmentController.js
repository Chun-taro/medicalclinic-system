const Appointment = require('../models/Appointment');

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    const appointment = new Appointment({
      patientId: req.user.userId,
      ...req.body
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments for patient
const getPatientAppointments = async (req, res) => {
  try {
    if (
      req.user.role !== 'patient' ||
      req.user.userId.toString() !== req.params.patientId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: req.params.patientId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find().sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve appointment
const approveAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment approved', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current patient's appointments
const getMyAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: req.user.userId }).sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Start consultation
const startConsultation = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (appointment.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved appointments can begin consultation' });
    }

    appointment.status = 'in-consultation';
    await appointment.save();

    res.json({ message: 'Consultation started', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Complete consultation
const completeConsultation = async (req, res) => {
  try {
    const updateFields = {
      ...req.body,
      status: 'completed',
      consultationCompletedAt: req.body.consultationCompletedAt || new Date()
    };

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate reports
const generateReports = async (req, res) => {
  try {
    const appointments = await Appointment.find();

    const totalAppointments = appointments.length;
    const approved = appointments.filter(app => app.status === 'approved').length;
    const rejected = appointments.filter(app => app.status === 'rejected').length;
    const completed = appointments.filter(app => app.status === 'completed').length;

    const scheduled = appointments.filter(app => app.type === 'scheduled').length;
    const walkIn = appointments.filter(app => app.type === 'walk-in').length;

    const topDiagnosis = findMostCommon(appointments.map(app => app.diagnosis));
    const topComplaint = findMostCommon(appointments.map(app => app.purpose));
    const referralRate = Math.round(
      (appointments.filter(app => app.referredToPhysician).length / totalAppointments) * 100
    );

    res.json({
      totalAppointments,
      approved,
      rejected,
      completed,
      scheduled,
      walkIn,
      topDiagnosis,
      topComplaint,
      referralRate
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Get consultations
const getConsultations = async (req, res) => {
  try {
    const consultations = await Appointment.find({ diagnosis: { $ne: null } })
      .select('firstName lastName appointmentDate consultationCompletedAt chiefComplaint diagnosis management bloodPressure temperature heartRate oxygenSaturation bmi medicinesPrescribed referredToPhysician physicianName firstAidDone firstAidWithin30Mins')
      .sort({ consultationCompletedAt: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get consultation by ID
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id);
    if (!consultation || !consultation.diagnosis) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function
function findMostCommon(arr) {
  const freq = {};
  arr.forEach(item => {
    if (item) freq[item] = (freq[item] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}

module.exports = {
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
};
