"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const traitController = require('../controllers/traitController');
const authController = require('./../controllers/authController');
const router = express_1.default.Router({ mergeParams: true });
router
    .route('/')
    .get(traitController.getAllTraits)
    .post(authController.protect, authController.restrictTo('admin'), traitController.createTrait);
router
    .route('/:sectionSlug')
    .get(traitController.getTrait)
    .patch(authController.protect, authController.restrictTo('admin'), traitController.updateTrait)
    .delete(authController.protect, authController.restrictTo('admin'), traitController.deleteTrait);
module.exports = router;
