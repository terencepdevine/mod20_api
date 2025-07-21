import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAbility extends Document {
  name: string;
  description?: string;
  system: mongoose.Types.ObjectId;
}

const abilitySchema = new Schema<IAbility>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  system: { type: Schema.Types.ObjectId, ref: 'System' }
});

const Ability: Model<IAbility> = mongoose.model<IAbility>('Ability', abilitySchema);

export default Ability;