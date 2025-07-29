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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Models
const System = require('../models/systemModel');
const SystemCharacter = require('../models/systemCharacterModel');
const Ability = require('../models/abilityModel');
const Role = require('../models/roleModel');
const Race = require('../models/raceModel');
// Utils
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// =============================================================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// =============================================================================
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/systems');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const filename = `system-background-${req.params.systemSlug}-${Date.now()}.${ext}`;
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
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadBackgroundImage = upload.single('backgroundImage');
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Creates abilities for a system and returns their IDs
 */
const createSystemAbilities = (abilities, systemId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!abilities || !Array.isArray(abilities))
        return [];
    const abilityIds = [];
    for (let i = 0; i < abilities.length; i++) {
        const abilityData = abilities[i];
        if (abilityData.name && abilityData.name.trim()) {
            const ability = yield Ability.create({
                name: abilityData.name.trim(),
                description: abilityData.description || '',
                system: systemId,
                order: abilityData.order !== undefined ? abilityData.order : i
            });
            abilityIds.push(ability._id);
        }
    }
    return abilityIds;
});
/**
 * Cascade delete all system-related data
 */
const cascadeDeleteSystemData = (systemId, characterId) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete all system-related data in parallel for better performance
    yield Promise.all([
        Role.deleteMany({ system: systemId }),
        Race.deleteMany({ system: systemId }),
        Ability.deleteMany({ system: systemId }),
        characterId ? SystemCharacter.findByIdAndDelete(characterId) : Promise.resolve()
    ]);
});
// =============================================================================
// SYSTEM CRUD OPERATIONS
// =============================================================================
exports.getAllSystems = factory.getAll(System);
exports.getSystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const system = yield System.findOne({ slug: req.params.systemSlug });
    if (!system) {
        return next(new AppError('No System found with that Slug', 404));
    }
    res.status(200).json({
        status: 'success',
        data: system
    });
}));
exports.createSystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { abilities } = _a, systemData = __rest(_a, ["abilities"]);
    // Create the system first
    const system = yield System.create(systemData);
    // Handle abilities creation if provided
    if (abilities && Array.isArray(abilities)) {
        const abilityIds = yield createSystemAbilities(abilities, system._id);
        if (abilityIds.length > 0) {
            system.abilities = abilityIds;
            yield system.save();
        }
    }
    // Populate abilities for response, sorted by order
    yield system.populate({
        path: 'abilities',
        options: { sort: { order: 1 } }
    });
    res.status(201).json({
        status: 'success',
        data: system
    });
}));
exports.updateSystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { abilities } = _a, systemUpdates = __rest(_a, ["abilities"]);
    // Handle file upload
    if (req.file) {
        systemUpdates.backgroundImage = req.file.filename;
    }
    // Find the existing system
    const existingSystem = yield System.findOne({ slug: req.params.systemSlug });
    if (!existingSystem) {
        return next(new AppError('No System found with that Slug', 404));
    }
    // Handle abilities update if provided
    if (abilities && Array.isArray(abilities)) {
        // Remove existing abilities for this system
        yield Ability.deleteMany({ system: existingSystem._id });
        // Create new abilities
        const abilityIds = yield createSystemAbilities(abilities, existingSystem._id);
        systemUpdates.abilities = abilityIds;
    }
    // Manually set updatedAt timestamp
    systemUpdates.updatedAt = new Date();
    // Update the system
    const system = yield System.findOneAndUpdate({ slug: req.params.systemSlug }, systemUpdates, {
        new: true,
        runValidators: true
    }).populate({
        path: 'abilities',
        options: { sort: { order: 1 } }
    });
    res.status(200).json({
        status: 'success',
        data: system
    });
}));
exports.deleteSystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { systemSlug } = req.params;
    // Find the system by slug
    const system = yield System.findOne({ slug: systemSlug }).populate('character');
    if (!system) {
        return next(new AppError('No System found with that slug', 404));
    }
    try {
        // Cascade delete all related data
        yield cascadeDeleteSystemData(system._id, (_a = system.character) === null || _a === void 0 ? void 0 : _a._id);
        // Delete the system itself
        yield System.findByIdAndDelete(system._id);
    }
    catch (error) {
        return next(new AppError('Failed to delete system and related data', 500));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// =============================================================================
// SYSTEM NAVIGATION AND CHARACTER DATA
// =============================================================================
exports.getSystemNavigation = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const system = yield System.findOne({ slug: req.params.systemSlug }).select('name character slug id');
    if (!system) {
        return next(new AppError('No System found with that Slug', 404));
    }
    const navigation = [
        {
            name: 'Roles',
            slug: 'roles',
            children: system.character.roles.map((role) => ({
                name: role.name,
                slug: role.slug
            }))
        },
        {
            name: 'Races',
            slug: 'races',
            children: system.character.races.map((race) => ({
                name: race.name,
                slug: race.slug
            }))
        }
    ];
    res.status(200).json({
        status: 'success',
        data: {
            system: system.name,
            systemSlug: system.slug,
            systemId: system.id,
            navigation
        }
    });
}));
exports.getSystemCharacter = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const system = yield System.findById(req.params.systemId).select('name id character');
    if (!system) {
        return next(new AppError('No System found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            breadcrumbs: {
                system: {
                    name: system.name,
                    id: system.id
                }
            },
            character: system.character
        }
    });
}));
exports.getSystemIntroduction = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const system = yield System.findOne({ slug: req.params.systemSlug });
    if (!system) {
        return next(new AppError('No System found with that Slug', 404));
    }
    res.status(200).json({
        status: 'success',
        data: system
    });
}));
