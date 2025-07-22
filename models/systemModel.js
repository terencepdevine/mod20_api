"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const setSlug = require('../utils/setSlug');
const systemSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A System must have a name'],
        unique: true,
        trim: true,
        minlength: 4,
        maxlength: 40
    },
    abilities: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Ability'
        }
    ],
    skills: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Skill'
        }
    ],
    slug: {
        type: String
    },
    version: {
        type: String,
        default: '1.0',
        required: true,
        match: /^[0-9]+\.[0-9]+$/
    },
    introduction: {
        type: String
    },
    character: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SystemCharacter'
    },
    backgroundImage: {
        type: String,
        default: 'default.jpg'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
systemSchema.pre('save', setSlug);
systemSchema.pre('findOneAndUpdate', setSlug);
systemSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.character) {
            try {
                const SystemCharacter = mongoose_1.default.model('SystemCharacter');
                const newSystemCharacter = yield SystemCharacter.create({
                    name: `${this.name} System Character`
                });
                this.character = newSystemCharacter._id;
            }
            catch (err) {
                throw err;
            }
        }
        next();
    });
});
systemSchema.pre(/^find/, function (next) {
    if (this.options.skipPopulation)
        return next();
    this.populate({
        path: 'character',
        select: '-__v'
    });
    next();
});
const System = mongoose_1.default.model('System', systemSchema);
module.exports = System;
