import mongoose, { Schema, Document } from 'mongoose';
import { RaceType } from '@mod20/types';

const setSlug = require('../utils/setSlug');

const raceSchema = new Schema<RaceType>(
  {
    name: {
      type: String,
      required: [true, 'A System must have a name'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 40
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    systems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'System'
      }
    ],
    age: {
      type: String
    },
    size: {
      type: String
    },
    speedWalking: {
      type: Number
    },
    speedClimbing: {
      type: Number
    },
    speedFlying: {
      type: Number
    },
    speedSwimming: {
      type: Number
    },
    speedBurrowing: {
      type: Number
    },
    languages: {
      type: String
    },
    traits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
      }
    ],
    alignment: {
      value: {
        type: String,
        required: [true, 'An alignment is required'],
        default: 'True Neutral',
        enum: {
          values: [
            'Lawful Good',
            'Neutral Good',
            'Chaotic Good',
            'Lawful Neutral',
            'True Neutral',
            'Chaotic Neutral',
            'Lawful Evil',
            'Neutral Evil',
            'Chaotic Evil'
          ],
          message: 'Alignment must be one of the 9 D&D alignments'
        }
      },
      description: {
        type: String,
        trim: true,
        maxlength: [
          500,
          'Alignment description must have less than 500 characters'
        ]
      }
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

raceSchema.pre('save', setSlug);
raceSchema.pre('findOneAndUpdate', setSlug);

raceSchema.pre(/^find/, function(next) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'traits',
    select: '-__v'
  });
  next();
});

const Race = mongoose.model<RaceType>('Race', raceSchema);

module.exports = Race;
