import mongoose, { Schema, Document, Model } from 'mongoose';
import { TraitType } from '@mod20/types/src/TraitType';

const traitSchema = new Schema<TraitType>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
});

const Trait: Model<TraitType> = mongoose.model<TraitType>('Trait', traitSchema);

module.exports = Trait;