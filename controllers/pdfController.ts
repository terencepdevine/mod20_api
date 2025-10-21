import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const Pdf = require('../models/pdfModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Multer storage configuration for PDF library
const multerStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = 'public/pdf/library';
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Create unique filename with timestamp
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitized = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueFilename = `${sanitized}-${Date.now()}${ext}`;
    cb(null, uniqueFilename);
  }
});

// File filter to accept only PDFs
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Not a PDF! Please upload only PDF files.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

exports.uploadPdfMiddleware = upload.single('pdf');

// Upload PDF to library
exports.uploadPdf = catchAsync(
  async (req: RequestWithFile, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('Please upload a PDF file', 400));
    }

    const { system, alt } = req.body;

    if (!system) {
      // Delete the uploaded file if system is missing
      fs.unlinkSync(req.file.path);
      return next(new AppError('System ID is required', 400));
    }

    // Get file stats
    const stats = fs.statSync(req.file.path);

    // Create PDF document in database
    const pdf = await Pdf.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      system,
      fileSize: stats.size,
      alt: alt || req.file.originalname,
      uploadedAt: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        pdf
      }
    });
  }
);

// Get all PDFs for a system
exports.getPdfsBySystem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { systemId } = req.params;

    if (!systemId) {
      return next(new AppError('System ID is required', 400));
    }

    const pdfs = await Pdf.find({ system: systemId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: pdfs.length,
      data: {
        pdfs
      }
    });
  }
);

// Delete PDF from library
exports.deletePdf = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { pdfId } = req.params;

    const pdf = await Pdf.findById(pdfId);

    if (!pdf) {
      return next(new AppError('No PDF found with that ID', 404));
    }

    // Delete file from filesystem
    const filePath = path.join('public/pdf/library', pdf.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Pdf.findByIdAndDelete(pdfId);

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// Update PDF metadata
exports.updatePdf = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { pdfId } = req.params;
    const { alt } = req.body;

    const pdf = await Pdf.findByIdAndUpdate(
      pdfId,
      { alt },
      { new: true, runValidators: true }
    );

    if (!pdf) {
      return next(new AppError('No PDF found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        pdf
      }
    });
  }
);
