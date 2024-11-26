const mongoose = require('mongoose');

const systemCharacterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    roles: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Role',
        default: []
      }
    ],
    races: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Race',
        default: []
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

systemCharacterSchema.pre(/^find/, function(next) {
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

const SystemCharacter = mongoose.model(
  'SystemCharacter',
  systemCharacterSchema
);

module.exports = SystemCharacter;
