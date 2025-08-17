import { Request, Response, NextFunction } from 'express';

const Trait = require('../models/traitModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllTraits = factory.getAll(Trait);

exports.getTrait = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trait = await Trait.findOne({ slug: req.params.sectionSlug });
    if (!trait) return next(new AppError('No Trait found with that Slug', 404));
    
    res.status(200).json({
      status: 'success',
      data: {
        breadcrumbs: {},
        trait: trait
      }
    });
  }
);

exports.createTrait = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newTrait = await Trait.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        trait: newTrait
      }
    });
  }
);

exports.updateTrait = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Remove system field from updates to preserve existing system association
    const updateData = { ...req.body };
    delete updateData.system;
    
    // Manually set updatedAt timestamp
    updateData.updatedAt = new Date();

    const trait = await Trait.findOneAndUpdate(
      { slug: req.params.sectionSlug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!trait) return next(new AppError('No Trait found with that slug', 404));

    res.status(200).json({
      status: 'success',
      data: {
        trait: trait
      }
    });
  }
);

exports.deleteTrait = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trait = await Trait.findOneAndDelete({ slug: req.params.sectionSlug });

    if (!trait) return next(new AppError('No Trait found with that slug', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);