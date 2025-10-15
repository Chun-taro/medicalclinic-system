const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true } // ✅ REMOVE `unique: true`
  ,genericName: String,
  brandName: String,
  description: String,
  dosageForm: String, // e.g., tablet, syrup, capsule
  strength: String,   // e.g., 500mg, 5ml
  quantityInStock: { type: Number, default: 0 },
  unit: String,       // e.g., pcs, bottles, strips
  expiryDate: Date,
  available: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);