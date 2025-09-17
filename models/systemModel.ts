import mongoose, { Schema, Document, Model } from 'mongoose';
import { SystemType } from '@mod20/types/src/SystemType';
const setSlug = require('../utils/setSlug');

const systemSchema = new Schema<SystemType>(
  {
    name: {
      type: String,
      required: [true, 'A System must have a name'],
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 40
    },
    abilities: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Ability'
      }
    ],
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill'
      }
    ],
    slug: {
      type: String
    },
    introduction: {
      type: String
    },
    character: {
      type: Schema.Types.ObjectId,
      ref: 'SystemCharacter'
    },
    backgroundImageId: String,
    mental: {
      type: Boolean,
      default: false
    },
    mentalName: {
      type: String,
      default: ''
    },
    mentalConditions: [{
      id: String,
      name: String,
      slug: String,
      description: String,
      severity: Number,
      minPercentage: Number,
      maxPercentage: Number,
      system: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    backgroundColorFamily: {
      type: String,
      default: 'gray'
    },
    primaryColorFamily: {
      type: String,
      default: 'blue'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

systemSchema.pre('save', setSlug);
systemSchema.pre('findOneAndUpdate', setSlug);

systemSchema.pre('save', async function(this: SystemType, next: () => void) {
  if (this.isNew && !this.character) {
    try {
      const SystemCharacter = mongoose.model('SystemCharacter');
      const newSystemCharacter = await SystemCharacter.create({
        name: `${this.name} System Character`
      });
      this.character = newSystemCharacter._id;
    } catch (err) {
      throw err;
    }
  }
  next();
});

systemSchema.pre(/^find/, function(this: any, next: () => void) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'character',
    select: '-__v'
  }).populate({
    path: 'abilities',
    select: 'name description abbr order',
    options: { sort: { order: 1 } }
  }).populate({
    path: 'skills',
    select: 'name description'
  });
  next();
});

const System: Model<SystemType> = mongoose.model<SystemType>(
  'System',
  systemSchema
);

module.exports = System;
