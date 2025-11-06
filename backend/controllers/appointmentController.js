const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendNotification } = require('../utils/sendNotification');



// Book appointment
const bookAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    const { appointmentDate, purpose } = req.body;
    if (!appointmentDate || !purpose) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointment = new Appointment({
  patientId: req.user.userId,
  appointmentDate,
  purpose,
  typeOfVisit: req.body.typeOfVisit || 'scheduled'
});

    await appointment.save();

    // Notify admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      sendNotification({
        userId: admin._id,
        status: 'pending',
        message: `New appointment booked by ${req.user.firstName || 'a patient'}`,
        recipientType: 'admin'
      });
    }

    // Notify patient
    sendNotification({
      userId: req.user.userId,
      status: 'pending',
      message: 'Your appointment request has been submitted and is pending approval.',
      recipientType: 'patient'
    });

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error(' Booking error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Get current patient's appointments
const getMyAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate('patientId', 'firstName lastName email contactNumber')
      .sort({ appointmentDate: -1 })
      .skip(page * limit)
      .limit(limit);

    res.json(appointments);
  } catch (err) {
    console.error(' Fetch my appointments error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Get appointments for a specific patient
const getPatientAppointments = async (req, res) => {
  try {
    const requestedPatientId = req.params.patientId;
    const isAdmin = req.user.role === 'admin';
    const isSelf = String(req.user.userId) === String(requestedPatientId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: requestedPatientId })
      .select('appointmentDate status purpose typeOfVisit diagnosis consultationCompletedAt')
      .sort({ appointmentDate: -1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error(' Patient appointments error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Get all appointments (admin only) 
const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;

    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email contactNumber') 
      .select('appointmentDate status purpose typeOfVisit patientId') 
      .sort({ appointmentDate: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error(' Admin fetch error:', err.message);
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

    sendNotification({
      userId: updated.patientId,
      status: 'approved',
      message: 'Your appointment has been approved',
      recipientType: 'patient'
    });

    res.json({ message: 'Appointment approved', appointment: updated });
  } catch (err) {
    console.error(' Approval error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Start consultation
const startConsultation = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (appointment.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved appointments can begin consultation' });
    }

    appointment.status = 'in-consultation';
    await appointment.save();

    sendNotification({
      userId: appointment.patientId,
      status: 'in-consultation',
      message: 'Your consultation has started',
      recipientType: 'patient'
    });

    res.json({ message: 'Consultation started', appointment });
  } catch (err) {
    console.error(' Start consultation error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Complete consultation
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

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Patient notification
    sendNotification({
      userId: appointment.patientId,
      status: 'completed',
      message: 'Your consultation has been completed',
      recipientType: 'patient'
    });

    // Admin notification
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      sendNotification({
        userId: admin._id,
        status: 'completed',
        message: `Consultation completed for patient ${appointment.firstName || ''} ${appointment.lastName || ''}`.trim(),
        recipientType: 'admin'
      });
    }

    res.json(appointment);
  } catch (err) {
    console.error(' Completion error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(' Delete error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Generate reports
const generateReports = async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();

    const totalAppointments = appointments.length;
    const approved = appointments.filter(app => app.status === 'approved').length;
    const rejected = appointments.filter(app => app.status === 'rejected').length;
    const completed = appointments.filter(app => app.status === 'completed').length;

    const scheduled = appointments.filter(app => app.typeOfVisit === 'scheduled').length;
    const walkIn = appointments.filter(app => app.typeOfVisit === 'walk-in').length;

    const topDiagnosis = findMostCommon(appointments.map(app => app.diagnosis));
    const topComplaint = findMostCommon(appointments.map(app => app.purpose));
    const referralRate = Math.round(
      (appointments.filter(app => app.referredToPhysician).length / (totalAppointments || 1)) * 100
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
    console.error(' Report error:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

//  Get consultations (all with diagnosis)
const getConsultations = async (req, res) => {
  try {
    const consultations = await Appointment.find({ diagnosis: { $ne: null } })
      .select(
        'firstName lastName appointmentDate consultationCompletedAt chiefComplaint diagnosis management bloodPressure temperature heartRate oxygenSaturation bmi medicinesPrescribed referredToPhysician physicianName firstAidDone firstAidWithin30Mins'
      )
      .sort({ consultationCompletedAt: -1 })
      .lean();

    res.json(consultations);
  } catch (err) {
    console.error(' Consultations error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

//  Get consultation by ID
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id).lean();
    if (!consultation || !consultation.diagnosis) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (err) {
    console.error(' Consultation ID error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

//  Helper: most common value
function findMostCommon(arr) {
  const freq = {};
  arr.forEach(item => {
    if (item) freq[item] = (freq[item] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}

//  Update appointment (admin or patient)
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(appointment.patientId) === String(req.user.userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Track changes
    const changes = [];
    const allowedFields = ['appointmentDate', 'purpose', 'typeOfVisit', 'diagnosis'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== appointment[field]) {
        appointment[field] = req.body[field];
        changes.push(field);
      }
    });

    await appointment.save();

    // Build notification message if something changed
    if (changes.length > 0) {
      let message = `Your appointment has been updated.`;
      if (changes.includes('appointmentDate')) {
        message += ` New date: ${new Date(appointment.appointmentDate).toLocaleDateString()}.`;
      }
      if (changes.includes('purpose')) {
        message += ` Purpose: ${appointment.purpose}.`;
      }
      if (changes.includes('typeOfVisit')) {
        message += ` Type of visit: ${appointment.typeOfVisit}.`;
      }
      if (changes.includes('diagnosis')) {
        message += ` Diagnosis: ${appointment.diagnosis}.`;
      }

      sendNotification({
        userId: appointment.patientId,
        status: 'updated',
        message,
        recipientType: 'patient'
      });
    }

    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    console.error(' Update error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
  getConsultationById,
  updateAppointment 
};