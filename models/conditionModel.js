"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const setSlug = require('../utils/setSlug');
// Condition schema for mental/resilience system states
const conditionSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    severity: {
        type: Number,
        min: 1,
        max: 10
    },
    system: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'System'
    }
}, {
    timestamps: true
});
// Auto-generate slug from name
conditionSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = setSlug(this.name);
    }
    next();
});
const Condition = mongoose_1.default.model('Condition', conditionSchema);
module.exports = Condition;
