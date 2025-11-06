const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const jwt = require('jsonwebtoken');

// Get all medicines
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1, expiryDate: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new medicine
const createMedicine = async (req, res) => {
  try {
    const { name, quantityInStock, boxesInStock, capsulesPerBox, unit, expiryDate } = req.body;

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
      existing.boxesInStock += parseInt(boxesInStock);
      existing.available = existing.quantityInStock > 0 || existing.boxesInStock > 0;
      await existing.save();
      return res.status(200).json(existing);
    }

    const newMedicine = new Medicine({
      name,
      quantityInStock: parseInt(quantityInStock),
      boxesInStock: parseInt(boxesInStock),
      capsulesPerBox: parseInt(capsulesPerBox),
      unit,
      expiryDate: expiry,
      available: parseInt(quantityInStock) > 0 || parseInt(boxesInStock) > 0
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Dispense capsules using :id from route
const dispenseCapsules = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    const totalAvailable = med.quantityInStock + (med.boxesInStock * med.capsulesPerBox);
    if (totalAvailable < quantity) {
      return res.status(400).json({ error: 'Not enough stock to dispense' });
    }

    if (med.quantityInStock < quantity) {
      const needed = quantity - med.quantityInStock;
      const boxesToOpen = Math.ceil(needed / med.capsulesPerBox);
      med.boxesInStock -= boxesToOpen;
      med.quantityInStock += boxesToOpen * med.capsulesPerBox;
    }

    med.quantityInStock -= quantity;
    med.available = med.quantityInStock > 0 || med.boxesInStock > 0;
    await med.save();

    res.json({ message: 'Medicine dispensed', medicine: med });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deduct multiple medicines
const deductMedicines = async (req, res) => {
  try {
    const { prescribed } = req.body;

    if (!Array.isArray(prescribed)) {
      return res.status(400).json({ error: 'Invalid prescribed list' });
    }

    for (const item of prescribed) {
      const med = await Medicine.findById(item.medicineId);
      if (!med) continue;

      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        console.warn(`Invalid quantity for ${med.name}:`, item.quantity);
        continue;
      }

      const totalAvailable = med.quantityInStock + (med.boxesInStock * med.capsulesPerBox);
      if (totalAvailable < qty) {
        return res.status(400).json({ error: `Not enough stock for ${med.name}` });
      }

      if (med.quantityInStock < qty) {
        const needed = qty - med.quantityInStock;
        const boxesToOpen = Math.ceil(needed / med.capsulesPerBox);
        med.boxesInStock -= boxesToOpen;
        med.quantityInStock += boxesToOpen * med.capsulesPerBox;
      }

      med.quantityInStock -= qty;
      med.available = med.quantityInStock > 0 || med.boxesInStock > 0;
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

module.exports = {
  getAllMedicines,
  createMedicine,
  dispenseCapsules,
  deductMedicines,
  deleteMedicine
};