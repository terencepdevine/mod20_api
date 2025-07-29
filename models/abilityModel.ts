import mongoose, { Schema, Document, Model } from 'mongoose';
import { AbilityType } from '@mod20/types/src/AbilityType';

const abilitySchema = new Schema<AbilityType>({
  name: { type: String, required: true },
  description: { type: String },
  system: { type: Schema.Types.ObjectId, ref: 'System', required: true },
  order: { type: Number, default: 0 }
});

const Ability: Model<AbilityType> = mongoose.model<AbilityType>('Ability', abilitySchema);

module.exports = Ability;