import mongoose, { Schema } from 'mongoose';
import { RaceType } from '@mod20/types';

const setSlug = require('../utils/setSlug');

const raceSchema = new Schema<RaceType>(
  {
    name: {
      type: String,
      required: [true, 'A Race must have a name'],
      trim: true,
      minlength: 2,
      maxlength: 40
    },
    slug: {
      type: String,
      required: [true, 'A Race must have a slug'],
      lowercase: true
    },
    introduction: {
      type: String,
      trim: true
    },
    system: {
      type: String,
      required: true
    },
    age: {
      type: Number
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
    images: {
      type: [
        {
          imageId: {
            type: String,
            required: true
          },
          orderby: {
            type: Number,
            required: true
          }
        }
      ],
      default: [],
      validate: {
        validator: function(
          images: Array<{ imageId: string; orderby: number }>
        ) {
          return images.length <= 9;
        },
        message: 'A race cannot have more than 9 images'
      }
    },
    backgroundImageId: String,
    characterSheets: {
      type: [
        {
          name: {
            type: String,
            required: true
          },
          fileId: {
            type: String,
            required: true
          },
          orderby: {
            type: Number,
            required: true,
            default: 0
          }
        }
      ],
      default: []
    },
    traits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trait'
      }
    ],
    abilityScoreBonuses: [
      {
        ability: {
          type: Schema.Types.ObjectId,
          ref: 'Ability',
          required: true
        },
        bonus: {
          type: Number,
          required: true,
          default: 0
        }
      }
    ],
    alignment: {
      value: {
        type: String,
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
            'Chaotic Evil',
            null
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

// Add compound unique index for name + system and slug + system
raceSchema.index({ name: 1, system: 1 }, { unique: true });
raceSchema.index({ slug: 1, system: 1 }, { unique: true });

raceSchema.pre('save', setSlug);
raceSchema.pre('findOneAndUpdate', setSlug);

raceSchema.pre(/^find/, function(next) {
  // if (this.options.skipPopulation) return next();

  this.populate({
    path: 'traits',
    select: 'name description'
  }).populate({
    path: 'abilityScoreBonuses.ability',
    select: 'name'
  });
  next();
});

const Race = mongoose.model<RaceType>('Race', raceSchema);

module.exports = Race;
