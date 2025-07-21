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
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const Role = require('../models/roleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
exports.getAllRoles = factory.getAll(Role);
const multerStorage = multer.diskStorage({
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
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadRoleImage = upload.single('photo');
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
    if (req.file) {
        req.body.photo = req.file.filename;
    }
    const role = yield Role.findOneAndUpdate({ slug: req.params.sectionSlug }, req.body, { new: true, runValidators: true });
    if (!role)
        return next(new AppError('No Role found with that slug', 404));
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
