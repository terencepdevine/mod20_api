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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const setSlug = require('../utils/setSlug');
const raceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A Race must have a name'],
        trim: true,
        minlength: 2,
        maxlength: 40
    },
    slug: {
        type: String,
        required: [true, 'A Race must have a slug'],
        lowercase: true
    },
    introduction: {
        type: String,
        trim: true
    },
    system: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'System',
        required: true
    },
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
    images: {
        type: [
            {
                imageId: {
                    type: String,
                    required: true
                },
                orderby: {
                    type: Number,
                    required: true
                }
            }
        ],
        default: [],
        validate: {
            validator: function (images) {
                return images.length <= 9;
            },
            message: 'A race cannot have more than 9 images'
        }
    },
    backgroundImageId: String,
    traits: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Trait'
        }
    ],
    abilityScoreBonuses: [
        {
            ability: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Ability',
                required: true
            },
            bonus: {
                type: Number,
                required: true,
                default: 0
            }
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Add compound unique index for name + system and slug + system
raceSchema.index({ name: 1, system: 1 }, { unique: true });
raceSchema.index({ slug: 1, system: 1 }, { unique: true });
raceSchema.pre('save', setSlug);
raceSchema.pre('findOneAndUpdate', setSlug);
raceSchema.pre(/^find/, function (next) {
    // if (this.options.skipPopulation) return next();
    this.populate({
        path: 'traits',
        select: 'name description'
    }).populate({
        path: 'abilityScoreBonuses.ability',
        select: 'name'
    });
    next();
});
const Race = mongoose_1.default.model('Race', raceSchema);
module.exports = Race;
