const express = require('express');
const router = express.Router();
const { 
  getAllMedicines, 
  createMedicine, 
  dispenseCapsules, 
  deductMedicines, 
  deleteMedicine 
} = require('../controllers/medicineController');

// GET all medicines
router.get('/', getAllMedicines);

// POST new medicine
router.post('/', createMedicine);

// POST dispense capsules
router.post('/dispense', dispenseCapsules);

// POST deduct multiple medicines
router.post('/deduct', deductMedicines);

// DELETE /api/medicines/:id
router.delete('/:id', deleteMedicine);

module.exports = router;