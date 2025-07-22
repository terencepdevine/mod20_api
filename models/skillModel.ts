import mongoose, { Schema, Document, Model } from 'mongoose';
import { SkillType } from '@mod20/types/src/SkillType';

const skillSchema = new Schema<SkillType>({
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

const Skill: Model<SkillType> = mongoose.model<SkillType>('Skill', skillSchema);

module.exports = Skill;