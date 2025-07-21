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
const Race = require('../models/raceModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
exports.getAllRaces = factory.getAll(Race);
exports.getRace = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const race = yield Race.findOne({ slug: req.params.sectionSlug });
    if (!race)
        return next(new AppError('No Race found with that Slug', 404));
    res.status(200).json({
        status: 'success',
        data: {
            breadcrumbs: {},
            race: race
        }
    });
}));
exports.createRace = factory.createOne(Race);
exports.updateRace = factory.updateOne(Race);
exports.deleteRace = factory.deleteOne(Race);
