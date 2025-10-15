const mongoose = require('mongoose');
const Medicine = require('../models/Medicine'); // adjust path if needed

const medicineNames = [
  "Acetylcysteine",
  "Aluminum Magnesium Hydroxide",
  "Ambroxol HC",
  "Amlodipine",
  "Amoxicillin Clavulanic Acid",
  "Anoxin Syrup",
  "Amexción",
  "Ascorbic Acid Syrup",
  "Aspirin",
  "Atenolol",
  "Betahistine HC",
  "Bisacodyl",
  "Budesonide Nebule",
  "Butamirate Citrate",
  "Calcium Ascorbate",
  "Captopril",
  "Carbocisteine",
  "Somp Caps",
  "Celecoxib",
  "Cetirigine",
  "Cetirizine",
  "Ciprofloxacin HC",
  "Clindamin"
];

mongoose.connect('mongodb://localhost:27017/your-db-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');

  for (const name of medicineNames) {
    const exists = await Medicine.findOne({ name });
    if (!exists) {
      await Medicine.create({ name, quantityInStock: 100, unit: 'pcs' });
      console.log(`Seeded: ${name}`);
    } else {
      console.log(`Already exists: ${name}`);
    }
  }

  mongoose.disconnect();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});