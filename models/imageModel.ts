import mongoose, { Schema, Document, Model } from 'mongoose';
import { ImageType } from '@mod20/types/src/ImageType';

const imageSchema = new Schema<ImageType>(
  {
    filename: {
      type: String,
      required: [true, 'An image must have a filename'],
      trim: true,
      unique: true
    },
    originalName: {
      type: String,
      required: [true, 'An image must have an original name'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description must have less than 500 characters'],
      trim: true
    },
    alt: {
      type: String,
      required: [true, 'An image must have alt text'],
      maxlength: [200, 'Alt text must have less than 200 characters'],
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'An image must have a file size']
    },
    mimetype: {
      type: String,
      required: [true, 'An image must have a mimetype'],
      validate: {
        validator: function(mimetype: string) {
          return mimetype.startsWith('image/');
        },
        message: 'File must be an image'
      }
    },
    dimensions: {
      width: {
        type: Number,
        required: [true, 'Image width is required']
      },
      height: {
        type: Number,
        required: [true, 'Image height is required']
      }
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 20;
        },
        message: 'An image cannot have more than 20 tags'
      }
    },
    system: {
      type: Schema.Types.ObjectId,
      ref: 'System',
      required: [true, 'An image must belong to a system']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full file path
imageSchema.virtual('filePath').get(function(this: any) {
  return `/public/img/media/${this.filename}`;
});

// Index for better search performance
imageSchema.index({ filename: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ uploadedAt: -1 });
imageSchema.index({ system: 1 }); // Index for system-specific queries

const Image: Model<ImageType> = mongoose.model<ImageType>('Image', imageSchema);

module.exports = Image;