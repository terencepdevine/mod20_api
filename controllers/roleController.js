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
const Role = require('../models/roleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
exports.getAllRoles = factory.getAll(Role);
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/roles');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const filename = `role-${req.params.sectionSlug}-${Date.now()}.${ext}`;
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
    fileFilter: multerFilter
});
exports.uploadRoleImages = upload.array('images', 9);
exports.getRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield Role.findOne({ slug: req.params.sectionSlug });
    if (!role)
        return next(new AppError('No Role found with that Slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            breadcrumbs: {},
            role: role
        }
    });
}));
exports.createRole = factory.createOne(Role);
// exports.updateRole = factory.updateOne(Role);
exports.updateRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files && req.files.length > 0) {
        // Get existing images from the role
        const existingRole = yield Role.findOne({ slug: req.params.sectionSlug });
        const existingImages = (existingRole === null || existingRole === void 0 ? void 0 : existingRole.images) || [];
        // Add new image filenames
        const newImages = req.files.map(file => file.filename);
        const allImages = [...existingImages, ...newImages];
        // Ensure we don't exceed 9 images
        if (allImages.length > 9) {
            return next(new AppError('Cannot have more than 9 images. Please remove some existing images first.', 400));
        }
        req.body.images = allImages;
    }
    const role = yield Role.findOneAndUpdate({ slug: req.params.sectionSlug }, req.body, { new: true, runValidators: true });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
    res.status(200).json({
        status: 'success',
        data: role
    });
}));
exports.deleteRoleImage = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageIndex } = req.params;
    const role = yield Role.findOne({ slug: req.params.sectionSlug });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
    if (!role.images || role.images.length === 0) {
        return next(new AppError('No images found for this role', 404));
    }
    const index = parseInt(imageIndex);
    if (index < 0 || index >= role.images.length) {
        return next(new AppError('Invalid image index', 400));
    }
    // Remove image from array
    role.images.splice(index, 1);
    yield role.save();
    res.status(200).json({
        status: 'success',
        data: role
    });
}));
exports.deleteRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield Role.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// exports.deleteRole = factory.deleteOne(Role);
