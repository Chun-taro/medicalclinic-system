const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine');

// GET all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1, expiryDate: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new medicine
router.post('/', async (req, res) => {
  try {
    const { name, quantityInStock, boxesInStock, capsulesPerBox, unit, expiryDate } = req.body;

    const expiry = new Date(expiryDate);
    const startOfDay = new Date(expiry); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(expiry); endOfDay.setUTCHours(23, 59, 59, 999);

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
});

// POST dispense capsules
router.post('/dispense', async (req, res) => {
  try {
    const { medicineId, capsulesToDispense } = req.body;
    const med = await Medicine.findById(medicineId);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    while (med.quantityInStock < capsulesToDispense) {
      if (med.boxesInStock > 0) {
        med.boxesInStock -= 1;
        med.quantityInStock += med.capsulesPerBox;
      } else {
        return res.status(400).json({ error: 'Not enough stock to dispense' });
      }
    }

    med.quantityInStock -= capsulesToDispense;
    med.available = med.quantityInStock > 0 || med.boxesInStock > 0;
    await med.save();
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST deduct multiple medicines
router.post('/deduct', async (req, res) => {
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

      while (med.quantityInStock < qty) {
        if (med.boxesInStock > 0) {
          med.boxesInStock -= 1;
          med.quantityInStock += med.capsulesPerBox;
        } else {
          return res.status(400).json({ error: `Not enough stock for ${med.name}` });
        }
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
});

module.exports = router;