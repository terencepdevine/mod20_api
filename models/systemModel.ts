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
      type: Schema.Types.ObjectId,
      ref: 'SystemCharacter'
    },
    backgroundImage: {
      type: String,
      default: 'default.jpg'
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
  });
  next();
});

const System: Model<SystemType> = mongoose.model<SystemType>(
  'System',
  systemSchema
);

module.exports = System;
