import mongoose, { Schema, Document, Model } from 'mongoose';
import { SystemCharacterType } from '@mod20/types/src/SystemCharacterType';

export interface ISystemCharacter extends SystemCharacterType, Document {
  roles: mongoose.Types.ObjectId[];
  races: mongoose.Types.ObjectId[];
}

const systemCharacterSchema = new Schema<ISystemCharacter>(
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

const SystemCharacter: Model<ISystemCharacter> = mongoose.model<ISystemCharacter>(
  'SystemCharacter',
  systemCharacterSchema
);

export default SystemCharacter;