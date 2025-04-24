const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  relatedAbility: { type: mongoose.Schema.ObjectId, ref: 'Ability' },
  system: { type: mongoose.Schema.ObjectId, ref: 'System' }
});

skillSchema.pre(/^find/, function(next) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'relatedAbility',
    select: 'name'
  });
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
