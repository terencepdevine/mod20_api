import mongoose, { Schema, Document, Model } from 'mongoose';
import { SkillType } from '@mod20/types/src/SkillType';

export interface ISkill extends SkillType, Document {
  description?: string;
  relatedAbility: mongoose.Types.ObjectId;
  system: mongoose.Types.ObjectId;
}

const skillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  relatedAbility: { type: Schema.Types.ObjectId, ref: 'Ability' },
  system: { type: Schema.Types.ObjectId, ref: 'System' }
});

skillSchema.pre(/^find/, function(this: any, next: () => void) {
  if (this.options.skipPopulation) return next();

  this.populate({
    path: 'relatedAbility',
    select: 'name'
  });
  next();
});

const Skill: Model<ISkill> = mongoose.model<ISkill>('Skill', skillSchema);

export default Skill;