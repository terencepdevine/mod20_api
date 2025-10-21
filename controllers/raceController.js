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
const Race = require('../models/raceModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
exports.getAllRaces = factory.getAll(Race);
// PDF upload configuration for character sheets
const pdfStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pdf/races');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const filename = `character-sheet-${req.params.sectionSlug}-${Date.now()}.${ext}`;
        cb(null, filename);
    }
});
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new AppError('Not a PDF! Please upload only PDF files.', 400));
    }
};
const uploadPdf = (0, multer_1.default)({
    storage: pdfStorage,
    fileFilter: pdfFilter
});
exports.uploadCharacterSheet = uploadPdf.single('characterSheet');
exports.getRace = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const race = yield Race.findOne({ slug: req.params.sectionSlug });
    if (!race)
        return next(new AppError('No Race found with that Slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            breadcrumbs: {},
            race: race
        }
    });
}));
exports.createRace = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Process traits array to extract trait IDs in order
    if (req.body.traits && Array.isArray(req.body.traits)) {
        req.body.traits = req.body.traits
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((t) => t.trait);
    }
    const newRace = yield Race.create(req.body);
    // Add the race to the SystemCharacter's races array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    // Find the system and get its character
    const system = yield System.findById(req.body.system);
    if (system && system.character) {
        yield SystemCharacter.findByIdAndUpdate(system.character, { $addToSet: { races: newRace._id } }, { new: true });
    }
    res.status(201).json({
        status: 'success',
        data: {
            race: newRace
        }
    });
}));
exports.updateRace = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle ordered image structure updates (from MediaLibrary)
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
    // Handle ordered character sheets structure updates (from drag and drop reordering)
    if (req.body.characterSheets && Array.isArray(req.body.characterSheets)) {
        // Validate the ordered character sheets structure
        const isValidStructure = req.body.characterSheets.every((sheet) => sheet && typeof sheet.name === 'string' && typeof sheet.fileId === 'string' && typeof sheet.orderby === 'number');
        if (!isValidStructure) {
            return next(new AppError('Invalid character sheets structure. Expected array of {name: string, fileId: string, orderby: number}', 400));
        }
        // Sort by orderby to maintain consistency
        req.body.characterSheets = req.body.characterSheets.sort((a, b) => a.orderby - b.orderby);
    }
    // Process traits array to extract trait IDs in order
    if (req.body.traits && Array.isArray(req.body.traits)) {
        console.log('Original traits:', JSON.stringify(req.body.traits));
        const sortedTraits = req.body.traits
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log('Sorted traits:', JSON.stringify(sortedTraits));
        const traitIds = sortedTraits.map((t) => t.trait);
        console.log('Final trait IDs:', JSON.stringify(traitIds));
        req.body.traits = traitIds;
    }
    // Remove system field from updates to preserve existing system association
    const updateData = Object.assign({}, req.body);
    delete updateData.system;
    // Manually set updatedAt timestamp
    updateData.updatedAt = new Date();
    const race = yield Race.findOneAndUpdate({ slug: req.params.sectionSlug }, updateData, { new: true, runValidators: true });
    if (!race)
        return next(new AppError('No Race found with that slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            race: race
        }
    });
}));
exports.addCharacterSheet = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const race = yield Race.findOne({ slug: req.params.sectionSlug });
    if (!race)
        return next(new AppError('No Race found with that slug', 404));
    // Validate uploaded file and name
    if (!req.file) {
        return next(new AppError('Please upload a PDF file', 400));
    }
    if (!req.body.name) {
        return next(new AppError('Name is required for character sheet', 400));
    }
    const characterSheets = race.characterSheets || [];
    const newSheet = {
        name: req.body.name,
        fileId: req.file.filename, // Use the uploaded file's filename
        orderby: req.body.orderby !== undefined ? parseInt(req.body.orderby) : characterSheets.length
    };
    race.characterSheets = [...characterSheets, newSheet];
    yield race.save();
    res.status(200).json({
        status: 'success',
        data: {
            race: race
        }
    });
}));
exports.deleteCharacterSheet = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sheetIndex } = req.params;
    const race = yield Race.findOne({ slug: req.params.sectionSlug });
    if (!race)
        return next(new AppError('No Race found with that slug', 404));
    if (!race.characterSheets || race.characterSheets.length === 0) {
        return next(new AppError('No character sheets found for this race', 404));
    }
    const index = parseInt(sheetIndex);
    if (index < 0 || index >= race.characterSheets.length) {
        return next(new AppError('Invalid character sheet index', 400));
    }
    // Remove character sheet from array
    race.characterSheets.splice(index, 1);
    yield race.save();
    res.status(200).json({
        status: 'success',
        data: {
            race: race
        }
    });
}));
exports.deleteRace = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const race = yield Race.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!race)
        return next(new AppError('No Race found with that slug', 404));
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
