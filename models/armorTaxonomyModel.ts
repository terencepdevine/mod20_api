import mongoose, { Schema, Document, Model } from 'mongoose';
import { ArmorTaxonomyType } from '@mod20/types/src/ArmorTaxonomyType';

export interface IArmorTaxonomy extends ArmorTaxonomyType, Document {}

const ArmorTaxonomySchema = new Schema<IArmorTaxonomy>({
  name: { type: String, required: true }
});

const ArmorTaxonomy: Model<IArmorTaxonomy> = mongoose.model<IArmorTaxonomy>('ArmorTaxonomy', ArmorTaxonomySchema);

export default ArmorTaxonomy;