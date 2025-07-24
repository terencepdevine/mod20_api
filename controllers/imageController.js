"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import sizeOf from 'image-size'; // Commented out - install with: npm install image-size @types/image-size
const Image = require('../models/imageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
// Multer storage configuration for media library
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/img/media';
        // Ensure directory exists
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        const filename = `${baseName}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! Please upload only images.', 400));
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
exports.uploadImageFile = upload.single('image');
// Upload new image to media library
exports.uploadImage = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { description, alt, tags } = req.body;
    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
        try {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }
        catch (e) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()) : [];
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
        uploadedAt: new Date()
    };
    const image = yield Image.create(imageData);
    res.status(201).json({
        status: 'success',
        data: {
            image
        }
    });
}));
// Get all images for media library (with pagination, search, filtering)
exports.getAllImages = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Build query
    const features = new APIFeatures(Image.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const images = yield features.query;
    const total = yield Image.countDocuments();
    res.status(200).json({
        status: 'success',
        results: images.length,
        total,
        data: {
            images
        }
    });
}));
// Get single image
exports.getImage = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield Image.findById(req.params.id);
    if (!image) {
        return next(new AppError('No image found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            image
        }
    });
}));
// Update image metadata (description, alt, tags)
exports.updateImage = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Only allow updating certain fields
    const allowedFields = ['description', 'alt', 'tags'];
    const updateData = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });
    // Parse tags if provided as string
    if (updateData.tags && typeof updateData.tags === 'string') {
        try {
            updateData.tags = JSON.parse(updateData.tags);
        }
        catch (e) {
            updateData.tags = updateData.tags.split(',').map((tag) => tag.trim());
        }
    }
    const image = yield Image.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });
    if (!image) {
        return next(new AppError('No image found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            image
        }
    });
}));
// Delete image (removes both DB record and file)
exports.deleteImage = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield Image.findById(req.params.id);
    if (!image) {
        return next(new AppError('No image found with that ID', 404));
    }
    // Remove file from filesystem
    const filePath = path_1.default.join('public/img/media', image.filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    // Remove from database
    yield Image.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// Search images (additional endpoint for advanced search)
exports.searchImages = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { q, tags, mimetype, minWidth, maxWidth, minHeight, maxHeight } = req.query;
    const searchQuery = {};
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
        if (minWidth)
            searchQuery['dimensions.width'].$gte = parseInt(minWidth);
        if (maxWidth)
            searchQuery['dimensions.width'].$lte = parseInt(maxWidth);
    }
    if (minHeight || maxHeight) {
        searchQuery['dimensions.height'] = {};
        if (minHeight)
            searchQuery['dimensions.height'].$gte = parseInt(minHeight);
        if (maxHeight)
            searchQuery['dimensions.height'].$lte = parseInt(maxHeight);
    }
    const images = yield Image.find(searchQuery)
        .sort({ uploadedAt: -1 })
        .limit(50);
    res.status(200).json({
        status: 'success',
        results: images.length,
        data: {
            images
        }
    });
}));
