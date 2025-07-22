import mongoose, { Schema, Document, Model } from 'mongoose';
import { ImageType } from '@mod20/types/src/ImageType';

const imageSchema = new Schema<ImageType>(
  {
    file: {
      type: String,
      required: [true, 'An image must have a file path or URL'],
      trim: true
    },
    altText: {
      type: String,
      required: [true, 'An image must have alt text'],
      maxlength: [200, 'Alt text must have less than 200 characters'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description must have less than 500 characters'],
      trim: true
    },
    artistName: {
      type: String,
      required: [true, 'An image must have an artist name'],
      maxlength: [100, 'Artist name must have less than 100 characters'],
      trim: true
    },
    artistUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Image: Model<ImageType> = mongoose.model<ImageType>('Image', imageSchema);

module.exports = Image;