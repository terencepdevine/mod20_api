import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// import sizeOf from 'image-size'; // Commented out - install with: npm install image-size @types/image-size

const Image = require('../models/imageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Multer storage configuration for media library
const multerStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = 'public/img/media';
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
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${baseName}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

exports.uploadImageFile = upload.single('image');

// Upload new image to media library
exports.uploadImage = catchAsync(
  async (req: RequestWithFile, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    // Get image dimensions (using image-size package - install with: npm install image-size @types/image-size)
    // For now, using default dimensions - implement proper dimension detection after installing image-size
    const dimensions = { width: 800, height: 600 }; // Default dimensions - replace with sizeOf(req.file.path) after installing image-size
    
    // TODO: Uncomment after installing image-size package
    // const filePath = req.file.path;
    // const dimensions = sizeOf(filePath);
    // if (!dimensions || !dimensions.width || !dimensions.height) {
    //   fs.unlinkSync(filePath);
    //   return next(new AppError('Unable to read image dimensions', 400));
    // }

    // Extract additional fields from request body
    const { description, alt, tags, system } = req.body;
    
    // System is required for all images
    if (!system) {
      return next(new AppError('System ID is required for image upload', 400));
    }
    
    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : [];
      }
    }

    // Create image record
    const imageData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      alt: alt || req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height
      },
      tags: parsedTags,
      system: system, // Associate with system
      uploadedAt: new Date()
    };

    console.log('uploadImage: Creating image with data:', imageData);
    const image = await Image.create(imageData);
    console.log('uploadImage: Created image:', image);

    res.status(201).json({
      status: 'success',
      data: {
        image
      }
    });
  }
);

// Get all images for media library (with pagination, search, filtering)
exports.getAllImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { systemId, ...otherQuery } = req.query;
    
    console.log('getAllImages: Received systemId:', systemId);
    console.log('getAllImages: Query params:', req.query);
    
    // Build base query - filter by system if provided
    let baseQuery = systemId ? Image.find({ system: systemId }) : Image.find();
    
    console.log('getAllImages: Using query filter:', systemId ? { system: systemId } : 'no filter');
    
    // Build query with features (excluding systemId from query params to avoid conflicts)
    const features = new APIFeatures(baseQuery, otherQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const images = await features.query;
    const total = systemId 
      ? await Image.countDocuments({ system: systemId })
      : await Image.countDocuments();

    console.log('getAllImages: Found images:', images.length);
    console.log('getAllImages: Sample image systems:', images.slice(0, 3).map((img: any) => ({ id: img._id, system: img.system })));
    console.log('getAllImages: Full first image data:', images[0]);

    res.status(200).json({
      status: 'success',
      results: images.length,
      total,
      data: {
        images
      }
    });
  }
);

// Get single image
exports.getImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return next(new AppError('No image found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        image
      }
    });
  }
);

// Update image metadata (description, alt, tags)
exports.updateImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Only allow updating certain fields
    const allowedFields = ['description', 'alt', 'tags'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Parse tags if provided as string
    if (updateData.tags && typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = updateData.tags.split(',').map((tag: string) => tag.trim());
      }
    }

    const image = await Image.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!image) {
      return next(new AppError('No image found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        image
      }
    });
  }
);

// Delete image (removes both DB record and file)
exports.deleteImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return next(new AppError('No image found with that ID', 404));
    }

    // Remove file from filesystem
    const filePath = path.join('public/img/media', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await Image.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// Search images (additional endpoint for advanced search)
exports.searchImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q, tags, mimetype, minWidth, maxWidth, minHeight, maxHeight, systemId } = req.query;
    
    const searchQuery: any = {};
    
    // Filter by system if provided
    if (systemId) {
      searchQuery.system = systemId;
    }
    
    // Text search across filename, originalName, description, alt
    if (q) {
      searchQuery.$or = [
        { filename: { $regex: q, $options: 'i' } },
        { originalName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { alt: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Tag search
    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      searchQuery.tags = { $in: tagArray };
    }
    
    // Mimetype filter
    if (mimetype) {
      searchQuery.mimetype = { $regex: mimetype, $options: 'i' };
    }
    
    // Dimension filters
    if (minWidth || maxWidth) {
      searchQuery['dimensions.width'] = {};
      if (minWidth) searchQuery['dimensions.width'].$gte = parseInt(minWidth as string);
      if (maxWidth) searchQuery['dimensions.width'].$lte = parseInt(maxWidth as string);
    }
    
    if (minHeight || maxHeight) {
      searchQuery['dimensions.height'] = {};
      if (minHeight) searchQuery['dimensions.height'].$gte = parseInt(minHeight as string);
      if (maxHeight) searchQuery['dimensions.height'].$lte = parseInt(maxHeight as string);
    }

    const images = await Image.find(searchQuery)
      .sort({ uploadedAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: images.length,
      data: {
        images
      }
    });
  }
);