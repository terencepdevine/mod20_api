import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IImage extends Document {
  file: string;
  altText: string;
  description?: string;
  artistName: string;
  artistUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImage>(
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

const Image: Model<IImage> = mongoose.model<IImage>('Image', imageSchema);

export default Image;