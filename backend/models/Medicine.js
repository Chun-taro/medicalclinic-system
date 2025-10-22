const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  brandName: String,
  description: String,
  dosageForm: String,
  strength: String,

  quantityInStock: { type: Number, default: 0 },
  boxesInStock: { type: Number, default: 0 },
  capsulesPerBox: { type: Number, default: 0 },

  unit: String,
  expiryDate: Date,
  available: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);