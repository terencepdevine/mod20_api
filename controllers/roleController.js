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
    const role = yield Role.findOne({ slug: req.params.sectionSlug }).populate({
        path: 'primaryAbility',
        select: 'name description'
    });
    if (!role)
        return next(new AppError('No Role found with that Slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            role: role
        }
    });
}));
exports.createRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('=== CREATING NEW ROLE ===');
    console.log('Request body:', req.body);
    const newRole = yield Role.create(req.body);
    console.log('New role created with ID:', newRole._id);
    // Add the role to the SystemCharacter's roles array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    console.log('Looking for system with ID:', req.body.system);
    // Find the system and get its character
    const system = yield System.findById(req.body.system);
    console.log('Found system:', system ? system.name : 'null');
    console.log('System character ID:', system === null || system === void 0 ? void 0 : system.character);
    if (system && system.character) {
        const updateResult = yield SystemCharacter.findByIdAndUpdate(system.character, { $addToSet: { roles: newRole._id } }, { new: true });
        console.log('SystemCharacter update result:', updateResult ? 'success' : 'failed');
        console.log('Updated roles array length:', (_a = updateResult === null || updateResult === void 0 ? void 0 : updateResult.roles) === null || _a === void 0 ? void 0 : _a.length);
    }
    else {
        console.log('System or system.character not found for role creation');
    }
    // Populate the role with primaryAbility like getRole does
    const populatedRole = yield Role.findById(newRole._id).populate({
        path: 'primaryAbility',
        select: 'name description'
    });
    res.status(201).json({
        status: 'success',
        data: {
            role: populatedRole
        }
    });
}));
// exports.updateRole = factory.updateOne(Role);
exports.updateRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle file uploads (for new image uploads via file input)
    if (req.files && req.files.length > 0) {
        // Get existing images from the role
        const existingRole = yield Role.findOne({ slug: req.params.sectionSlug });
        const existingImages = (existingRole === null || existingRole === void 0 ? void 0 : existingRole.images) || [];
        // Add new image filenames with orderby values
        const newImages = req.files.map((file, index) => ({
            imageId: file.filename,
            orderby: existingImages.length + index
        }));
        const allImages = [...existingImages, ...newImages];
        // Ensure we don't exceed 9 images
        if (allImages.length > 9) {
            return next(new AppError('Cannot have more than 9 images. Please remove some existing images first.', 400));
        }
        req.body.images = allImages;
    }
    // Handle ordered image structure updates (from drag and drop reordering)
    if (req.body.images && Array.isArray(req.body.images)) {
        // Validate the ordered images structure
        const isValidStructure = req.body.images.every((img) => img && typeof img.imageId === 'string' && typeof img.orderby === 'number');
        if (!isValidStructure) {
            return next(new AppError('Invalid images structure. Expected array of {imageId: string, orderby: number}', 400));
        }
        // Ensure we don't exceed 9 images
        if (req.body.images.length > 9) {
            return next(new AppError('Cannot have more than 9 images', 400));
        }
        // Sort by orderby to maintain consistency
        req.body.images = req.body.images.sort((a, b) => a.orderby - b.orderby);
    }
    // Remove system field from updates to preserve existing system association
    const updateData = Object.assign({}, req.body);
    delete updateData.system;
    const role = yield Role.findOneAndUpdate({ slug: req.params.sectionSlug }, updateData, { new: true, runValidators: true }).populate({
        path: 'primaryAbility',
        select: 'name description'
    });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            role: role
        }
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
        data: {
            role: role
        }
    });
}));
exports.deleteRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield Role.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
    // Remove the role from the SystemCharacter's roles array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    // Find the system and remove role from its character
    const system = yield System.findById(role.system);
    if (system && system.character) {
        yield SystemCharacter.findByIdAndUpdate(system.character, { $pull: { roles: role._id } });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// exports.deleteRole = factory.deleteOne(Role);
