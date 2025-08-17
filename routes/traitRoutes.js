"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const traitController = require('../controllers/traitController');
const router = express_1.default.Router({ mergeParams: true });
router
    .route('/')
    .get(traitController.getAllTraits)
    .post(traitController.createTrait);
router
    .route('/:sectionSlug')
    .get(traitController.getTrait)
    .patch(traitController.updateTrait)
    .delete(traitController.deleteTrait);
module.exports = router;
