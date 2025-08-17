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
const traitSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A trait must have a name'],
        trim: true,
        minlength: 2,
        maxlength: 40
    },
    slug: {
        type: String,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    system: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'System',
        required: true
    },
    order: {
        type: Number,
        default: 0
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
// Add compound unique index for slug + system (slugs must be unique within a system)
traitSchema.index({ slug: 1, system: 1 }, { unique: true });
// Add index for performance (but not unique to allow duplicate names)
traitSchema.index({ name: 1, system: 1 });
// Add slug generation middleware
traitSchema.pre('save', setSlug);
traitSchema.pre('findOneAndUpdate', setSlug);
const Trait = mongoose_1.default.model('Trait', traitSchema);
module.exports = Trait;
