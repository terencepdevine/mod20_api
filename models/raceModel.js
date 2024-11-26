const mongoose = require('mongoose');
const setSlug = require('../utils/setSlug');

const raceSchema = new mongoose.Schema(
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
      type: String
    },
    systems: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'System'
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

const Race = mongoose.model('Race', raceSchema);

module.exports = Race;
