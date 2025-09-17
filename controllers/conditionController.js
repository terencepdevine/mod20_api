"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Condition = require('../models/conditionModel');
const factory = require('./handlerFactory');
// Basic CRUD operations for Conditions using handlerFactory
exports.getAllConditions = factory.getAll(Condition);
exports.getCondition = factory.getOne(Condition);
exports.createCondition = factory.createOne(Condition);
exports.updateCondition = factory.updateOne(Condition);
exports.deleteCondition = factory.deleteOne(Condition);
// Get conditions by system
exports.getConditionsBySystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { systemSlug } = req.params;
        const System = require('../models/systemModel');
        const system = yield System.findOne({ slug: systemSlug });
        if (!system) {
            return res.status(404).json({
                status: 'fail',
                message: 'No system found with that slug'
            });
        }
        const conditions = yield Condition.find({ system: system._id })
            .select('-__v')
            .sort({ severity: 1, name: 1 });
        res.status(200).json({
            status: 'success',
            results: conditions.length,
            data: {
                conditions
            }
        });
    }
    catch (err) {
        next(err);
    }
});
