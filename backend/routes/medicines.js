const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// GET all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1, expiryDate: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new medicine or update batch
router.post('/', async (req, res) => {
  try {
    const { name, quantityInStock, unit, expiryDate } = req.body;

    const expiry = new Date(expiryDate);
    const startOfDay = new Date(expiry);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(expiry);
    endOfDay.setHours(23, 59, 59, 999);

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
      quantityInStock,
      unit,
      expiryDate: expiry,
      available: quantityInStock > 0
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;