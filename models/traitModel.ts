import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrait extends Document {
  name: string;
  description?: string;
}

const traitSchema = new Schema<ITrait>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
});

const Trait: Model<ITrait> = mongoose.model<ITrait>('Trait', traitSchema);

export default Trait;