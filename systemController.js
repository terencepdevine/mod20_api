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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
Object.defineProperty(exports, "__esModule", { value: true });
var multer = require("multer");
var SystemCharacter = require('../models/systemCharacterModel');
var System = require('../models/systemModel');
var Ability = require('../models/abilityModel');
var Role = require('../models/roleModel');
var Race = require('../models/raceModel');
var AppError = require('../utils/appError');
var catchAsync = require('../utils/catchAsync');
var factory = require('./handlerFactory');
var multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/systems');
    },
    filename: function (req, file, cb) {
        var ext = file.mimetype.split('/')[1];
        var filename = "system-background-".concat(req.params.sectionSlug, "-").concat(Date.now(), ".").concat(ext);
        cb(null, filename);
    }
});
var multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};
var upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadBackgroundImage = upload.single('backgroundImage');
exports.getSystemNavigation = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var system, navigation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, System.findOne({ slug: req.params.systemSlug }).select('name character slug id')];
            case 1:
                system = _a.sent();
                if (!system)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                navigation = [
                    {
                        name: 'Roles',
                        slug: 'roles',
                        children: system.character.roles.map(function (role) { return ({
                            name: role.name,
                            slug: role.slug
                        }); })
                    },
                    {
                        name: 'Races',
                        slug: 'races',
                        children: system.character.races.map(function (race) { return ({
                            name: race.name,
                            slug: race.slug
                        }); })
                    }
                ];
                res.status(200).json({
                    status: 'success',
                    data: {
                        system: system.name,
                        systemSlug: system.slug,
                        systemId: system.id,
                        navigation: navigation
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getSystemCharacter = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var query, doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, System.findById(req.params.systemId).select('name id character')];
            case 1:
                query = _a.sent();
                return [4 /*yield*/, query];
            case 2:
                doc = _a.sent();
                if (!doc)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                res.status(200).json({
                    status: 'success',
                    data: {
                        breadcrumbs: {
                            system: {
                                name: doc.name,
                                id: doc.id
                            }
                        },
                        character: doc.character
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getSystemIntroduction = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, System.findOne({ slug: req.params.systemSlug })];
            case 1:
                doc = _a.sent();
                if (!doc)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                res.status(200).json({
                    status: 'success',
                    data: { test: doc }
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getAllSystems = factory.getAll(System);
exports.getSystem = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var system;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, System.findOne({ slug: req.params.systemSlug })];
            case 1:
                system = _a.sent();
                if (!system)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                res.status(200).json({
                    status: 'success',
                    data: system
                });
                return [2 /*return*/];
        }
    });
}); });
exports.createSystem = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, abilities, systemData, system, abilityIds, i, abilityData, ability;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, abilities = _a.abilities, systemData = __rest(_a, ["abilities"]);
                return [4 /*yield*/, System.create(systemData)];
            case 1:
                system = _b.sent();
                if (!(abilities && Array.isArray(abilities))) return [3 /*break*/, 7];
                abilityIds = [];
                i = 0;
                _b.label = 2;
            case 2:
                if (!(i < abilities.length)) return [3 /*break*/, 5];
                abilityData = abilities[i];
                if (!(abilityData.name && abilityData.name.trim())) return [3 /*break*/, 4];
                return [4 /*yield*/, Ability.create({
                        name: abilityData.name.trim(),
                        description: abilityData.description || '',
                        system: system._id,
                        order: abilityData.order !== undefined ? abilityData.order : i
                    })];
            case 3:
                ability = _b.sent();
                abilityIds.push(ability._id);
                _b.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                if (!(abilityIds.length > 0)) return [3 /*break*/, 7];
                system.abilities = abilityIds;
                return [4 /*yield*/, system.save()];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: 
            // Populate abilities for response, sorted by order
            return [4 /*yield*/, system.populate({
                    path: 'abilities',
                    options: { sort: { order: 1 } }
                })];
            case 8:
                // Populate abilities for response, sorted by order
                _b.sent();
                res.status(201).json({
                    status: 'success',
                    data: system
                });
                return [2 /*return*/];
        }
    });
}); });
exports.updateSystem = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, characterUpdates, roles, races, abilities, systemUpdates, abilityIds, existingSystem, i, abilityData, ability, system;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, characterUpdates = _a.characterUpdates, roles = _a.roles, races = _a.races, abilities = _a.abilities, systemUpdates = __rest(_a, ["characterUpdates", "roles", "races", "abilities"]);
                if (req.file) {
                    req.body.backgroundImage = req.file.filename;
                }
                abilityIds = [];
                if (!(abilities && Array.isArray(abilities))) return [3 /*break*/, 7];
                return [4 /*yield*/, System.findOne({ slug: req.params.systemSlug })];
            case 1:
                existingSystem = _b.sent();
                if (!existingSystem)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                // Remove existing abilities for this system
                return [4 /*yield*/, Ability.deleteMany({ system: existingSystem._id })];
            case 2:
                // Remove existing abilities for this system
                _b.sent();
                i = 0;
                _b.label = 3;
            case 3:
                if (!(i < abilities.length)) return [3 /*break*/, 6];
                abilityData = abilities[i];
                if (!(abilityData.name && abilityData.name.trim())) return [3 /*break*/, 5];
                return [4 /*yield*/, Ability.create({
                        name: abilityData.name.trim(),
                        description: abilityData.description || '',
                        system: existingSystem._id,
                        order: abilityData.order !== undefined ? abilityData.order : i
                    })];
            case 4:
                ability = _b.sent();
                abilityIds.push(ability._id);
                _b.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6:
                // Add abilities to system updates
                systemUpdates.abilities = abilityIds;
                _b.label = 7;
            case 7: return [4 /*yield*/, System.findOneAndUpdate({ slug: req.params.systemSlug }, systemUpdates, {
                    new: true,
                    runValidators: true
                }).populate({
                    path: 'abilities',
                    options: { sort: { order: 1 } }
                })];
            case 8:
                system = _b.sent();
                if (!system)
                    return [2 /*return*/, next(new AppError('No System found with that Slug', 404))];
                res.status(200).json({
                    status: 'success',
                    data: system
                });
                return [2 /*return*/];
        }
    });
}); });
exports.deleteSystem = catchAsync(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var systemSlug, system, deletedRoles, deletedRaces, deletedAbilities, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                systemSlug = req.params.systemSlug;
                return [4 /*yield*/, System.findOne({ slug: systemSlug }).populate('character')];
            case 1:
                system = _b.sent();
                if (!system)
                    return [2 /*return*/, next(new AppError('No System found with that slug', 404))];
                console.log('=== DELETING SYSTEM WITH CASCADE ===');
                console.log('System slug:', systemSlug);
                console.log('System ID:', system._id);
                console.log('System name:', system.name);
                console.log('System character ID:', (_a = system.character) === null || _a === void 0 ? void 0 : _a._id);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 9, , 10]);
                return [4 /*yield*/, Role.deleteMany({ system: system._id })];
            case 3:
                deletedRoles = _b.sent();
                console.log("Deleted ".concat(deletedRoles.deletedCount, " roles"));
                return [4 /*yield*/, Race.deleteMany({ system: system._id })];
            case 4:
                deletedRaces = _b.sent();
                console.log("Deleted ".concat(deletedRaces.deletedCount, " races"));
                return [4 /*yield*/, Ability.deleteMany({ system: system._id })];
            case 5:
                deletedAbilities = _b.sent();
                console.log("Deleted ".concat(deletedAbilities.deletedCount, " abilities"));
                if (!(system.character && system.character._id)) return [3 /*break*/, 7];
                return [4 /*yield*/, SystemCharacter.findByIdAndDelete(system.character._id)];
            case 6:
                _b.sent();
                console.log('Deleted SystemCharacter record');
                _b.label = 7;
            case 7: 
            // 5. Delete the system itself
            return [4 /*yield*/, System.findByIdAndDelete(system._id)];
            case 8:
                // 5. Delete the system itself
                _b.sent();
                console.log('System deleted successfully');
                return [3 /*break*/, 10];
            case 9:
                error_1 = _b.sent();
                console.error('Error during cascading delete:', error_1);
                return [2 /*return*/, next(new AppError('Failed to delete system and related data', 500))];
            case 10:
                res.status(204).json({
                    status: 'success',
                    data: null
                });
                return [2 /*return*/];
        }
    });
}); });
