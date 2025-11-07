const express = require('express');
const router = express.Router();
const {
  getAllMedicines,
  createMedicine,
  dispenseCapsules,
  deductMedicines,
  deleteMedicine,
  getDispenseHistory ,
  getAllDispenseHistory
} = require('../controllers/medicineController');

router.get('/', getAllMedicines);
router.post('/', createMedicine);
router.post('/deduct', deductMedicines);
router.delete('/:id', deleteMedicine);
router.post('/:id/dispense', dispenseCapsules);
router.get('/:id/history', getDispenseHistory);
router.get('/history', getAllDispenseHistory); 

module.exports = router;