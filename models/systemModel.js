const mongoose = require('mongoose');
const setSlug = require('../utils/setSlug');
const SystemCharacter = require('./systemCharacterModel');

const systemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A System must have a name'],
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 40
    },
    slug: {
      type: String
    },
    version: {
      type: String,
      default: '1.0',
      required: true,
      match: /^[0-9]+\.[0-9]+$/
    },
    introduction: {
      type: String
    },
    character: {
      type: mongoose.Schema.ObjectId,
      ref: 'SystemCharacter'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Automatically set slug
systemSchema.pre('save', setSlug);
systemSchema.pre('findOneAndUpdate', setSlug);

// Create default SystemCharacter if missing
systemSchema.pre('save', async function(next) {
  if (this.isNew && !this.character) {
    try {
      const newSystemCharacter = await SystemCharacter.create({
        name: `${this.name} System Character`
      });
      this.character = newSystemCharacter._id;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Automatically populate character field
systemSchema.pre(/^find/, function(next) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'character',
    select: '-__v'
  });
  next();
});

const System = mongoose.model('System', systemSchema);

module.exports = System;
