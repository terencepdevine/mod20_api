const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  system: { type: mongoose.Schema.ObjectId, ref: 'System' }
});

module.exports = mongoose.model('Ability', abilitySchema);
