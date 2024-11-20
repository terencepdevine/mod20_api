const mongoose = require('mongoose');
const setSlug = require('../utils/setSlug');

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
    roles: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Role'
      }
    ],
    races: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Race'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

systemSchema.pre('save', setSlug);
systemSchema.pre('findOneAndUpdate', setSlug);

systemSchema.pre(/^find/, function(next) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'roles',
    select: '-__v',
    options: { sort: { name: 1 } }
  }).populate({
    path: 'races',
    select: '-__v',
    options: { sort: { name: 1 } }
  });

  next();
});

const System = mongoose.model('System', systemSchema);

module.exports = System;
