const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/appointments/book
router.post('/book', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    const appointment = new Appointment({
      patientId: req.user.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      purpose: req.body.purpose,
      appointmentDate: req.body.appointmentDate
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/patient/:patientId
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    if (
      req.user.role !== 'patient' ||
      req.user.userId.toString() !== req.params.patientId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: req.params.patientId });
    res.json(appointments); // includes consultation fields
  } catch (err) {
    console.error('Fetch patient appointments error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find().sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Fetch all appointments error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('DELETE route hit for ID:', req.params.id);

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/appointments/:id/approve
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment approved', appointment: updated });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointments = await Appointment.find({ patientId: req.user.userId }).sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching patient appointments:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/start-consultation', auth, async (req, res) => {
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
    console.error('Start consultation error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/consultation', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
          status: 'completed', // ✅ mark consultation as done
          consultationCompletedAt: new Date() // optional timestamp
        }
      },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    console.error('Consultation update error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reports', auth, async (req, res) => {
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
    console.error('Report generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

function findMostCommon(arr) {
  const freq = {};
  arr.forEach(item => {
    if (item) freq[item] = (freq[item] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}

router.get('/consultations', async (req, res) => {
  try {
    const consultations = await Appointment.find({ diagnosis: { $ne: null } })
      .select('firstName lastName date chiefComplaint diagnosis management bloodPressure temperature heartRate oxygenSaturation bmi medicinesPrescribed')
      .sort({ date: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/consultation/:id', async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id);
    if (!consultation || !consultation.diagnosis) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;