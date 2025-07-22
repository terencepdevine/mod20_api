import mongoose, { Schema, Document, Model } from 'mongoose';
import { SystemCharacterType } from '@mod20/types/src/SystemCharacterType';

const systemCharacterSchema = new Schema<SystemCharacterType>(
  {
    name: {
      type: String,
      trim: true
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: []
      }
    ],
    races: [
      {
        type: Schema.Types.ObjectId,
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

systemCharacterSchema.pre(/^find/, function(this: any, next: () => void) {
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

const SystemCharacter: Model<SystemCharacterType> = mongoose.model<
  SystemCharacterType
>('SystemCharacter', systemCharacterSchema);

module.exports = SystemCharacter;
