import mongoose, { Schema, Document, Model } from 'mongoose';
import { AbilityType } from '@mod20/types/src/AbilityType';

const abilitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  abbr: { type: String },
  system: { type: Schema.Types.ObjectId, ref: 'System', required: true },
  order: { type: Number, default: 0 }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure model is registered properly
let Ability;
try {
  Ability = mongoose.model('Ability');
} catch (error) {
  Ability = mongoose.model('Ability', abilitySchema);
}

module.exports = Ability;