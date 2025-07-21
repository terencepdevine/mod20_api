import { Request, Response, NextFunction } from 'express';

const Race = require('../models/raceModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllRaces = factory.getAll(Race);

exports.getRace = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const race = await Race.findOne({ slug: req.params.sectionSlug });
    if (!race) return next(new AppError('No Race found with that Slug', 404));
    res.status(200).json({
      status: 'success',
      data: {
        breadcrumbs: {},
        race: race
      }
    });
  }
);

exports.createRace = factory.createOne(Race);
exports.updateRace = factory.updateOne(Race);
exports.deleteRace = factory.deleteOne(Race);
