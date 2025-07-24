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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const setSlug = require('../utils/setSlug');
const raceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A System must have a name'],
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 40
    },
    slug: {
        type: String,
        required: [true, 'A System must have a slug'],
        unique: true,
        lowercase: true
    },
    systems: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'System'
        }
    ],
    age: {
        type: Number
    },
    size: {
        type: String
    },
    speedWalking: {
        type: Number
    },
    speedClimbing: {
        type: Number
    },
    speedFlying: {
        type: Number
    },
    speedSwimming: {
        type: Number
    },
    speedBurrowing: {
        type: Number
    },
    languages: {
        type: String
    },
    traits: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Trait'
        }
    ],
    alignment: {
        value: {
            type: String,
            default: 'True Neutral',
            enum: {
                values: [
                    'Lawful Good',
                    'Neutral Good',
                    'Chaotic Good',
                    'Lawful Neutral',
                    'True Neutral',
                    'Chaotic Neutral',
                    'Lawful Evil',
                    'Neutral Evil',
                    'Chaotic Evil',
                    null
                ],
                message: 'Alignment must be one of the 9 D&D alignments'
            }
        },
        description: {
            type: String,
            trim: true,
            maxlength: [
                500,
                'Alignment description must have less than 500 characters'
            ]
        }
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
raceSchema.pre('save', setSlug);
raceSchema.pre('findOneAndUpdate', setSlug);
raceSchema.pre(/^find/, function (next) {
    // if (this.options.skipPopulation) return next();
    this.populate({
        path: 'traits',
        select: '-__v'
    });
    next();
});
const Race = mongoose_1.default.model('Race', raceSchema);
module.exports = Race;
