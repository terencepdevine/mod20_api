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
    introduction: {
      type: String,
      trime: true,
      maxlength: [500, 'Introduction text must have less than 500 characters']
    },
    // spellSlotProgression: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'SpellSlotProgression'
    // },
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
