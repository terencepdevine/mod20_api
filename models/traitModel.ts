import mongoose, { Schema, Document, Model } from 'mongoose';
import { TraitType } from '@mod20/types/src/TraitType';

const setSlug = require('../utils/setSlug');

const traitSchema = new Schema<TraitType>({
  name: { 
    type: String, 
    required: [true, 'A trait must have a name'],
    trim: true,
    minlength: 2,
    maxlength: 40
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: { 
    type: String,
    trim: true 
  },
  system: { 
    type: Schema.Types.ObjectId, 
    ref: 'System', 
    required: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add compound unique index for slug + system (slugs must be unique within a system)
traitSchema.index({ slug: 1, system: 1 }, { unique: true });
// Add index for performance (but not unique to allow duplicate names)
traitSchema.index({ name: 1, system: 1 });

// Add slug generation middleware
traitSchema.pre('save', setSlug);
traitSchema.pre('findOneAndUpdate', setSlug);

const Trait: Model<TraitType> = mongoose.model<TraitType>('Trait', traitSchema);

module.exports = Trait;