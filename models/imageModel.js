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
const imageSchema = new mongoose_1.Schema({
    file: {
        type: String,
        required: [true, 'An image must have a file path or URL'],
        trim: true
    },
    altText: {
        type: String,
        required: [true, 'An image must have alt text'],
        maxlength: [200, 'Alt text must have less than 200 characters'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description must have less than 500 characters'],
        trim: true
    },
    artistName: {
        type: String,
        required: [true, 'An image must have an artist name'],
        maxlength: [100, 'Artist name must have less than 100 characters'],
        trim: true
    },
    artistUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
const Image = mongoose_1.default.model('Image', imageSchema);
module.exports = Image;
