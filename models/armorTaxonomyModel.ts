import mongoose, { Schema, Document, Model } from 'mongoose';
import { ArmorTaxonomyType } from '@mod20/types/src/ArmorTaxonomyType';

const ArmorTaxonomySchema = new Schema<ArmorTaxonomyType>({
  name: { type: String, required: true }
});

const ArmorTaxonomy: Model<ArmorTaxonomyType> = mongoose.model<
  ArmorTaxonomyType
>('ArmorTaxonomy', ArmorTaxonomySchema);

module.exports = ArmorTaxonomy;
