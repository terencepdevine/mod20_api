const mongoose = require('mongoose');
const setSlug = require('../utils/setSlug');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A role must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A role name must have less or equal then 40 characters'],
      minlength: [4, 'A role name must have more or equal then 10 characters']
    },
    slug: {
      type: String
    },
    hp_dice: {
      type: Number,
      required: true,
      default: 8,
      enum: {
        values: [4, 6, 8, 10, 12],
        message:
          'hp_dice must be one of the following values: 4, 6, 8, 10, or 12'
      }
    },
    alignment: {
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
    alignmentDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Alignment description must have less than 500 characters'
      ]
    },
    systems: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'System'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

roleSchema.pre('save', setSlug);
roleSchema.pre('findOneAndUpdate', setSlug);

// roleSchema.pre(/^find/, function(next) {
//   this.populate('systems');

//   next();
// });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
