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
    armorTaxonomies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'ArmorTaxonomy'
      }
    ],
    weaponTaxonomies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'WeaponTaxonomy'
      }
    ],
    savingThrows: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Ability',
        required: true
      }
    ],
    skills: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Skill',
        required: true
      }
    ],
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

roleSchema.pre(/^find/, function(next) {
  this.populate({ path: 'weaponTaxonomies' })
    .populate({ path: 'armorTaxonomies' })
    .populate({ path: 'savingThrows', select: 'name' })
    .populate({ path: 'skills', select: 'name -relatedAbility' });

  next();
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
