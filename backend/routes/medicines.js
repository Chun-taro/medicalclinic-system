const express = require('express');
const router = express.Router();
const {
  getAllMedicines,
  createMedicine,
  dispenseCapsules,
  deductMedicines,
  deleteMedicine
} = require('../controllers/medicineController');

router.get('/', getAllMedicines);
router.post('/', createMedicine);
router.post('/deduct', deductMedicines);
router.delete('/:id', deleteMedicine);

// Dispense route using :id
router.post('/:id/dispense', dispenseCapsules);

module.exports = router;