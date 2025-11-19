const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const jwt = require('jsonwebtoken');

// Get all medicines (admin or superadmin only)
const getAllMedicines = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'doctor' && req.user.role !== 'nurse') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const medicines = await Medicine.find().sort({ name: 1, expiryDate: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new medicine
const createMedicine = async (req, res) => {
  try {
    const { name, quantityInStock, unit, expiryDate } = req.body;

    if (!name || !quantityInStock || !unit || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expiry = new Date(expiryDate);
    const startOfDay = new Date(expiry);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(expiry);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await Medicine.findOne({
      name,
      expiryDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      existing.quantityInStock += parseInt(quantityInStock);
      existing.available = existing.quantityInStock > 0;
      await existing.save();
      return res.status(200).json(existing);
    }

    const newMedicine = new Medicine({
      name,
      quantityInStock: parseInt(quantityInStock),
      unit,
      expiryDate: expiry,
      available: parseInt(quantityInStock) > 0
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    console.error('Create medicine error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Dispense capsules using :id
const dispenseCapsules = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, appointmentId } = req.body;

    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    if (med.quantityInStock < quantity) {
      return res.status(400).json({ error: 'Not enough stock to dispense' });
    }

    med.quantityInStock -= quantity;
    med.available = med.quantityInStock > 0;

    // Extract user ID from token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Token decode failed:', err.message);
      }
    }

    // Log dispense history
    med.dispenseHistory = med.dispenseHistory || [];
    med.dispenseHistory.push({
      appointmentId: appointmentId ? new mongoose.Types.ObjectId(appointmentId) : null,
      quantity,
      dispensedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
      dispensedAt: new Date(),
      source: appointmentId ? 'consultation' : 'manual' 
    });

    await med.save();

    res.json({ message: 'Medicine dispensed', medicine: med });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deduct multiple medicines (used in consultation)
const deductMedicines = async (req, res) => {
  try {
    const { prescribed } = req.body;

    if (!Array.isArray(prescribed)) {
      return res.status(400).json({ error: 'Invalid prescribed list' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Token decode failed:', err.message);
      }
    }

    for (const item of prescribed) {
      const med = await Medicine.findById(item.medicineId);
      if (!med) continue;

      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        console.warn(`Invalid quantity for ${med.name}:`, item.quantity);
        continue;
      }

      if (med.quantityInStock < qty) {
        return res.status(400).json({ error: `Not enough stock for ${med.name}` });
      }

      med.quantityInStock -= qty;
      med.available = med.quantityInStock > 0;

      med.dispenseHistory = med.dispenseHistory || [];
      med.dispenseHistory.push({
        appointmentId: item.appointmentId ? new mongoose.Types.ObjectId(item.appointmentId) : null,
        quantity: qty,
        dispensedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
        dispensedAt: new Date(),
        source: 'consultation' 
      });

      await med.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Deduction error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const deleted = await Medicine.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Medicine not found' });

    return res.json({ message: 'Medicine deleted', id });
  } catch (err) {
    console.error('Delete medicine error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dispense history for a specific medicine
const getDispenseHistory = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id)
      .populate('dispenseHistory.appointmentId', 'firstName lastName appointmentDate')
      .populate('dispenseHistory.dispensedBy', 'name');

    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    res.json(med.dispenseHistory);
  } catch (err) {
    console.error('Dispense history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Get all dispense history across medicines
const getAllDispenseHistory = async (req, res) => {
  try {
    const medicines = await Medicine.find({}, 'name dispenseHistory')
      .populate('dispenseHistory.appointmentId', 'firstName lastName appointmentDate')
      .populate('dispenseHistory.dispensedBy', 'name');

    const allHistory = [];

    medicines.forEach(med => {
      med.dispenseHistory.forEach(record => {
        const sourceLabel =
          record.source === 'consultation'
            ? 'Consultation Dispense'
            : record.source === 'manual'
            ? 'Manual Dispense'
            : 'Unknown';

        allHistory.push({
          medicineName: med.name,
          quantity: record.quantity,
          dispensedAt: record.dispensedAt,
          dispensedBy: record.dispensedBy,
          appointmentId: record.appointmentId,
          source: sourceLabel 
        });
      });
    });

    res.json(allHistory);
  } catch (err) {
    console.error('Global dispense history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch global history' });
  }
};

module.exports = {
  getAllMedicines,
  createMedicine,
  dispenseCapsules,
  deductMedicines,
  deleteMedicine,
  getDispenseHistory,
  getAllDispenseHistory
};