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
const roleSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'A role must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A role name must have less or equal then 40 characters'],
        minlength: [4, 'A role name must have more or equal then 10 characters']
    },
    slug: {
        type: String
    },
    introduction: {
        type: String,
        trim: true,
        maxlength: [500, 'Introduction text must have less than 500 characters']
    },
    armorTaxonomies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ArmorTaxonomy'
        }
    ],
    weaponTaxonomies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'WeaponTaxonomy'
        }
    ],
    savingThrows: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Ability',
            required: true
        }
    ],
    skills: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Skill',
            required: true
        }
    ],
    hp_dice: {
        type: Number,
        required: true,
        default: 8,
        enum: {
            values: [4, 6, 8, 10, 12],
            message: 'hp_dice must be one of the following values: 4, 6, 8, 10, or 12'
        }
    },
    tools: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ToolTaxonomy'
        }
    ],
    systems: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'System'
        }
    ],
    photo: {
        type: String,
        default: 'default.jpg'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
roleSchema.pre('save', setSlug);
roleSchema.pre('findOneAndUpdate', setSlug);
roleSchema.pre(/^find/, function (next) {
    this.populate({ path: 'weaponTaxonomies' })
        .populate({ path: 'armorTaxonomies' })
        .populate({ path: 'savingThrows', select: 'name' })
        .populate({ path: 'skills', select: 'name -relatedAbility' })
        .populate({ path: 'tools' });
    next();
});
const Role = mongoose_1.default.model('Role', roleSchema);
module.exports = Role;
