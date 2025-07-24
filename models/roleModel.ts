import mongoose, { Schema, Document, Model } from 'mongoose';
import { RoleType } from '@mod20/types/src/RoleType';
const setSlug = require('../utils/setSlug');

const roleSchema = new Schema<RoleType>(
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
      trim: true,
      maxlength: [500, 'Introduction text must have less than 500 characters']
    },
    armorTaxonomies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ArmorTaxonomy'
      }
    ],
    weaponTaxonomies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'WeaponTaxonomy'
      }
    ],
    savingThrows: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Ability',
        required: true
      }
    ],
    skills: [
      {
        type: Schema.Types.ObjectId,
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
    tools: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ToolTaxonomy'
      }
    ],
    systems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'System'
      }
    ],
    images: {
      type: [{
        imageId: {
          type: String,
          required: true
        },
        orderby: {
          type: Number,
          required: true
        }
      }],
      default: [],
      validate: {
        validator: function(images: Array<{imageId: string, orderby: number}>) {
          return images.length <= 9;
        },
        message: 'A role cannot have more than 9 images'
      }
    },
    backgroundImageId: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

roleSchema.pre('save', setSlug);
roleSchema.pre('findOneAndUpdate', setSlug);

roleSchema.pre(/^find/, function(this: any, next: () => void) {
  this.populate({ path: 'weaponTaxonomies' })
    .populate({ path: 'armorTaxonomies' })
    .populate({ path: 'savingThrows', select: 'name' })
    .populate({ path: 'skills', select: 'name -relatedAbility' })
    .populate({ path: 'tools' });

  next();
});

const Role: Model<RoleType> = mongoose.model<RoleType>('Role', roleSchema);

module.exports = Role;
