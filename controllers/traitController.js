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
const Trait = require('../models/traitModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
exports.getAllTraits = factory.getAll(Trait);
exports.getTrait = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const trait = yield Trait.findOne({ slug: req.params.sectionSlug });
    if (!trait)
        return next(new AppError('No Trait found with that Slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            breadcrumbs: {},
            trait: trait
        }
    });
}));
exports.createTrait = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newTrait = yield Trait.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            trait: newTrait
        }
    });
}));
exports.updateTrait = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Remove system field from updates to preserve existing system association
    const updateData = Object.assign({}, req.body);
    delete updateData.system;
    // Manually set updatedAt timestamp
    updateData.updatedAt = new Date();
    const trait = yield Trait.findOneAndUpdate({ slug: req.params.sectionSlug }, updateData, { new: true, runValidators: true });
    if (!trait)
        return next(new AppError('No Trait found with that slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            trait: trait
        }
    });
}));
exports.deleteTrait = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const trait = yield Trait.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!trait)
        return next(new AppError('No Trait found with that slug', 404));
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
