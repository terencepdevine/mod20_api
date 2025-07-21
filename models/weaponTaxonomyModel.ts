import mongoose, { Schema, Document, Model } from 'mongoose';
import { WeaponTaxonomyType } from '@mod20/types/src/WeaponTaxonomyType';

export interface IWeaponTaxonomy extends WeaponTaxonomyType, Document {}

const WeaponTaxonomySchema = new Schema<IWeaponTaxonomy>({
  name: { type: String, required: true }
});

const WeaponTaxonomy: Model<IWeaponTaxonomy> = mongoose.model<IWeaponTaxonomy>('WeaponTaxonomy', WeaponTaxonomySchema);

export default WeaponTaxonomy;