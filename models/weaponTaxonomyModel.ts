import mongoose, { Schema, Document, Model } from 'mongoose';
import { WeaponTaxonomyType } from '@mod20/types/src/WeaponTaxonomyType';

const WeaponTaxonomySchema = new Schema<WeaponTaxonomyType>({
  name: { type: String, required: true }
});

const WeaponTaxonomy: Model<WeaponTaxonomyType> = mongoose.model<WeaponTaxonomyType>('WeaponTaxonomy', WeaponTaxonomySchema);

module.exports = WeaponTaxonomy;