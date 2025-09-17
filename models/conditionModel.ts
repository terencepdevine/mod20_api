import mongoose from 'mongoose';
import { ConditionType } from '@mod20/types';
const setSlug = require('../utils/setSlug');

// Condition schema for mental/resilience system states
const conditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 10
  },
  system: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'System'
  }
}, {
  timestamps: true
});

// Auto-generate slug from name
conditionSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = setSlug(this.name);
  }
  next();
});

const Condition = mongoose.model<ConditionType>('Condition', conditionSchema);

module.exports = Condition;
