import mongoose, { Schema } from 'mongoose';

interface PdfDocument {
  filename: string;
  originalName: string;
  system: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy?: string;
  alt?: string;
}

const pdfSchema = new Schema<PdfDocument>(
  {
    filename: {
      type: String,
      required: [true, 'A PDF must have a filename'],
      unique: true
    },
    originalName: {
      type: String,
      required: [true, 'A PDF must have an original name']
    },
    system: {
      type: String,
      required: [true, 'A PDF must belong to a system'],
      index: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String
    },
    alt: {
      type: String,
      trim: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient querying by system
pdfSchema.index({ system: 1, uploadedAt: -1 });

const Pdf = mongoose.model<PdfDocument>('Pdf', pdfSchema);

module.exports = Pdf;
