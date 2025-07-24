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
const imageSchema = new mongoose_1.Schema({
    filename: {
        type: String,
        required: [true, 'An image must have a filename'],
        trim: true,
        unique: true
    },
    originalName: {
        type: String,
        required: [true, 'An image must have an original name'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description must have less than 500 characters'],
        trim: true
    },
    alt: {
        type: String,
        required: [true, 'An image must have alt text'],
        maxlength: [200, 'Alt text must have less than 200 characters'],
        trim: true
    },
    fileSize: {
        type: Number,
        required: [true, 'An image must have a file size']
    },
    mimetype: {
        type: String,
        required: [true, 'An image must have a mimetype'],
        validate: {
            validator: function (mimetype) {
                return mimetype.startsWith('image/');
            },
            message: 'File must be an image'
        }
    },
    dimensions: {
        width: {
            type: Number,
            required: [true, 'Image width is required']
        },
        height: {
            type: Number,
            required: [true, 'Image height is required']
        }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function (tags) {
                return tags.length <= 20;
            },
            message: 'An image cannot have more than 20 tags'
        }
    },
    // Legacy fields for backward compatibility
    file: {
        type: String,
        trim: true
    },
    altText: {
        type: String,
        maxlength: [200, 'Alt text must have less than 200 characters'],
        trim: true
    },
    artistName: {
        type: String,
        maxlength: [100, 'Artist name must have less than 100 characters'],
        trim: true
    },
    artistUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for full file path
imageSchema.virtual('filePath').get(function () {
    return `/public/img/media/${this.filename}`;
});
// Index for better search performance
imageSchema.index({ filename: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ uploadedAt: -1 });
const Image = mongoose_1.default.model('Image', imageSchema);
module.exports = Image;
