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
    ]
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
