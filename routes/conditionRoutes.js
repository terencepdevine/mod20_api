"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conditionController = require('../controllers/conditionController');
const router = express_1.default.Router({ mergeParams: true });
// Routes for conditions within a system context
router
    .route('/')
    .get(conditionController.getConditionsBySystem)
    .post(conditionController.createCondition);
router
    .route('/:id')
    .get(conditionController.getCondition)
    .patch(conditionController.updateCondition)
    .delete(conditionController.deleteCondition);
// Global condition routes (for admin)
router
    .route('/all')
    .get(conditionController.getAllConditions);
module.exports = router;
