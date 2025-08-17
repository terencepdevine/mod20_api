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
const Skill = require('../models/skillModel');
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
        return { ids: [], idMap: new Map() };
    const abilityIds = [];
    const idMap = new Map(); // Maps frontend temp IDs to MongoDB ObjectIds
    for (let i = 0; i < abilities.length; i++) {
        const abilityData = abilities[i];
        if (abilityData.name && abilityData.name.trim()) {
            const ability = yield Ability.create({
                name: abilityData.name.trim(),
                description: abilityData.description || '',
                abbr: abilityData.abbr || '',
                system: systemId,
                order: abilityData.order !== undefined ? abilityData.order : i
            });
            abilityIds.push(ability._id);
            // Map the frontend temp ID to the real MongoDB ObjectId
            if (abilityData.id) {
                idMap.set(abilityData.id, ability._id.toString());
            }
        }
    }
    return { ids: abilityIds, idMap };
});
/**
 * Creates skills for a system and returns their IDs
 */
const createSystemSkills = (skills, systemId, abilityIdMap) => __awaiter(void 0, void 0, void 0, function* () {
    if (!skills || !Array.isArray(skills))
        return [];
    const skillIds = [];
    for (const skillData of skills) {
        if (skillData.name && skillData.name.trim()) {
            // Convert frontend ability ID to MongoDB ObjectId using the mapping
            let relatedAbilityId = null;
            if (skillData.relatedAbility) {
                // Check if it's a temp ID that needs mapping
                const mappedId = abilityIdMap.get(skillData.relatedAbility);
                relatedAbilityId = mappedId || skillData.relatedAbility;
            }
            const skill = yield Skill.create({
                name: skillData.name.trim(),
                description: skillData.description || '',
                relatedAbility: relatedAbilityId,
                system: systemId
            });
            skillIds.push(skill._id);
        }
    }
    return skillIds;
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
        Skill.deleteMany({ system: systemId }),
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
    const _a = req.body, { abilities, skills } = _a, systemData = __rest(_a, ["abilities", "skills"]);
    // Create the system first
    const system = yield System.create(systemData);
    // Handle abilities creation if provided
    let abilityIdMap = new Map();
    if (abilities && Array.isArray(abilities)) {
        const { ids: abilityIds, idMap } = yield createSystemAbilities(abilities, system._id);
        abilityIdMap = idMap;
        if (abilityIds.length > 0) {
            system.abilities = abilityIds;
        }
    }
    // Handle skills creation if provided (must happen after abilities for ID mapping)
    if (skills && Array.isArray(skills)) {
        const skillIds = yield createSystemSkills(skills, system._id, abilityIdMap);
        if (skillIds.length > 0) {
            system.skills = skillIds;
        }
    }
    // Save if we added abilities or skills
    if ((abilities && abilities.length > 0) || (skills && skills.length > 0)) {
        yield system.save();
    }
    // Populate abilities and skills for response
    yield system.populate([
        {
            path: 'abilities',
            options: { sort: { order: 1 } }
        },
        {
            path: 'skills',
            select: 'name description relatedAbility'
        }
    ]);
    res.status(201).json({
        status: 'success',
        data: system
    });
}));
exports.updateSystem = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const _c = req.body, { abilities, skills } = _c, systemUpdates = __rest(_c, ["abilities", "skills"]);
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
    let abilityIdMap = new Map();
    // First, build a map of ALL existing abilities for the system (for skill references)
    const allExistingAbilities = yield Ability.find({ system: existingSystem._id });
    allExistingAbilities.forEach((ability) => {
        abilityIdMap.set(ability._id.toString(), ability._id.toString());
    });
    if (abilities && Array.isArray(abilities)) {
        const abilityIds = [];
        // Get current abilities for comparison
        const currentAbilities = yield Ability.find({ system: existingSystem._id });
        const currentAbilityIds = currentAbilities.map((ability) => ability._id.toString());
        // Process each ability in the submitted list
        for (let i = 0; i < abilities.length; i++) {
            const abilityData = abilities[i];
            if (abilityData.id && currentAbilityIds.includes(abilityData.id.toString())) {
                // Update existing ability (name, description, abbr, order) but preserve ObjectId
                yield Ability.findByIdAndUpdate(abilityData.id, {
                    name: (_a = abilityData.name) === null || _a === void 0 ? void 0 : _a.trim(),
                    order: abilityData.order !== undefined ? abilityData.order : i,
                    description: abilityData.description || '',
                    abbr: abilityData.abbr || ''
                });
                abilityIds.push(abilityData.id);
                // For existing abilities, the frontend ID should already be the real ObjectId
                abilityIdMap.set(abilityData.id, abilityData.id);
            }
            else if (abilityData.name && abilityData.name.trim()) {
                // Create new ability (for abilities without id or with invalid id)
                const newAbility = yield Ability.create({
                    name: abilityData.name.trim(),
                    description: abilityData.description || '',
                    abbr: abilityData.abbr || '',
                    system: existingSystem._id,
                    order: abilityData.order !== undefined ? abilityData.order : i
                });
                abilityIds.push(newAbility._id);
                // Map frontend temp ID to real ObjectId for new abilities
                if (abilityData.id) {
                    abilityIdMap.set(abilityData.id, newAbility._id.toString());
                }
            }
        }
        // Find abilities that were removed
        const newAbilityIds = abilityIds.map((id) => id.toString());
        const abilitiesToDelete = currentAbilityIds.filter((id) => !newAbilityIds.includes(id));
        if (abilitiesToDelete.length > 0) {
            // Clean up references in roles before deleting abilities
            yield Role.updateMany({ primaryAbility: { $in: abilitiesToDelete } }, { $set: { primaryAbility: null } });
            yield Role.updateMany({ savingThrows: { $in: abilitiesToDelete } }, { $pullAll: { savingThrows: abilitiesToDelete } });
            // Delete the abilities
            yield Ability.deleteMany({ _id: { $in: abilitiesToDelete } });
        }
        // Update the system's abilities array
        systemUpdates.abilities = abilityIds;
    }
    // Handle skills update if provided
    if (skills && Array.isArray(skills)) {
        const skillIds = [];
        // Get current skills for comparison
        const currentSkills = yield Skill.find({ system: existingSystem._id });
        const currentSkillIds = currentSkills.map((skill) => skill._id.toString());
        // Process each skill in the submitted list
        for (const skillData of skills) {
            // Convert frontend ability ID to MongoDB ObjectId using the mapping
            let relatedAbilityId = null;
            if (skillData.relatedAbility) {
                const mappedId = abilityIdMap.get(skillData.relatedAbility);
                relatedAbilityId = mappedId || skillData.relatedAbility;
            }
            if (skillData.id && currentSkillIds.includes(skillData.id.toString())) {
                // Update existing skill
                yield Skill.findByIdAndUpdate(skillData.id, {
                    name: (_b = skillData.name) === null || _b === void 0 ? void 0 : _b.trim(),
                    description: skillData.description || '',
                    relatedAbility: relatedAbilityId
                });
                skillIds.push(skillData.id); // This should already be a valid ObjectId string from existing skills
            }
            else if (skillData.name && skillData.name.trim()) {
                // Create new skill
                const newSkill = yield Skill.create({
                    name: skillData.name.trim(),
                    description: skillData.description || '',
                    relatedAbility: relatedAbilityId,
                    system: existingSystem._id
                });
                skillIds.push(newSkill._id);
            }
        }
        // Find skills that were removed
        const newSkillIds = skillIds.map((id) => id.toString());
        const skillsToDelete = currentSkillIds.filter((id) => !newSkillIds.includes(id));
        if (skillsToDelete.length > 0) {
            // Delete the removed skills
            yield Skill.deleteMany({ _id: { $in: skillsToDelete } });
        }
        // Update the system's skills array
        systemUpdates.skills = skillIds;
    }
    // Manually set updatedAt timestamp
    systemUpdates.updatedAt = new Date();
    // Update the system
    const system = yield System.findOneAndUpdate({ slug: req.params.systemSlug }, systemUpdates, {
        new: true,
        runValidators: true
    }).populate([
        {
            path: 'abilities',
            options: { sort: { order: 1 } }
        },
        {
            path: 'skills',
            select: 'name description relatedAbility'
        }
    ]);
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
