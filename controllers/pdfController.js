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
const Pdf = require('../models/pdfModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// Multer storage configuration for PDF library
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/pdf/library';
        // Ensure directory exists
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext);
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
const multerFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new AppError('Not a PDF! Please upload only PDF files.', 400));
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
exports.uploadPdfMiddleware = upload.single('pdf');
// Upload PDF to library
exports.uploadPdf = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return next(new AppError('Please upload a PDF file', 400));
    }
    const { system, alt } = req.body;
    if (!system) {
        // Delete the uploaded file if system is missing
        fs_1.default.unlinkSync(req.file.path);
        return next(new AppError('System ID is required', 400));
    }
    // Get file stats
    const stats = fs_1.default.statSync(req.file.path);
    // Create PDF document in database
    const pdf = yield Pdf.create({
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
}));
// Get all PDFs for a system
exports.getPdfsBySystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { systemId } = req.params;
    if (!systemId) {
        return next(new AppError('System ID is required', 400));
    }
    const pdfs = yield Pdf.find({ system: systemId }).sort({ uploadedAt: -1 });
    res.status(200).json({
        status: 'success',
        results: pdfs.length,
        data: {
            pdfs
        }
    });
}));
// Delete PDF from library
exports.deletePdf = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pdfId } = req.params;
    const pdf = yield Pdf.findById(pdfId);
    if (!pdf) {
        return next(new AppError('No PDF found with that ID', 404));
    }
    // Delete file from filesystem
    const filePath = path_1.default.join('public/pdf/library', pdf.filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    // Delete from database
    yield Pdf.findByIdAndDelete(pdfId);
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// Update PDF metadata
exports.updatePdf = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pdfId } = req.params;
    const { alt } = req.body;
    const pdf = yield Pdf.findByIdAndUpdate(pdfId, { alt }, { new: true, runValidators: true });
    if (!pdf) {
        return next(new AppError('No PDF found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            pdf
        }
    });
}));
