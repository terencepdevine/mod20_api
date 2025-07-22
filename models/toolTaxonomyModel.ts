import mongoose, { Schema, Document, Model } from 'mongoose';
import { ToolTaxonomyType } from '@mod20/types/src/ToolTaxonomyType';

const ToolTaxonomySchema = new Schema<ToolTaxonomyType>({
  name: { type: String, required: true }
});

const ToolTaxonomy: Model<ToolTaxonomyType> = mongoose.model<ToolTaxonomyType>('ToolTaxonomy', ToolTaxonomySchema);

module.exports = ToolTaxonomy;