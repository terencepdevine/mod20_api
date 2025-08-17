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

exports.createRace = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Process traits array to extract trait IDs in order
    if (req.body.traits && Array.isArray(req.body.traits)) {
      req.body.traits = req.body.traits
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((t: any) => t.trait);
    }

    const newRace = await Race.create(req.body);

    // Add the race to the SystemCharacter's races array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    
    // Find the system and get its character
    const system = await System.findById(req.body.system);
    
    if (system && system.character) {
      await SystemCharacter.findByIdAndUpdate(
        system.character, 
        { $addToSet: { races: newRace._id } }, 
        { new: true }
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        race: newRace
      }
    });
  }
);

exports.updateRace = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Handle ordered image structure updates (from MediaLibrary)
    if (req.body.images && Array.isArray(req.body.images)) {
      // Validate the ordered images structure
      const isValidStructure = req.body.images.every((img: any) => 
        img && typeof img.imageId === 'string' && typeof img.orderby === 'number'
      );
      
      if (!isValidStructure) {
        return next(new AppError('Invalid images structure. Expected array of {imageId: string, orderby: number}', 400));
      }
      
      // Ensure we don't exceed 9 images
      if (req.body.images.length > 9) {
        return next(new AppError('Cannot have more than 9 images', 400));
      }
      
      // Sort by orderby to maintain consistency
      req.body.images = req.body.images.sort((a: any, b: any) => a.orderby - b.orderby);
    }

    // Process traits array to extract trait IDs in order
    if (req.body.traits && Array.isArray(req.body.traits)) {
      console.log('Original traits:', JSON.stringify(req.body.traits));
      const sortedTraits = req.body.traits
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      console.log('Sorted traits:', JSON.stringify(sortedTraits));
      const traitIds = sortedTraits.map((t: any) => t.trait);
      console.log('Final trait IDs:', JSON.stringify(traitIds));
      req.body.traits = traitIds;
    }

    // Remove system field from updates to preserve existing system association
    const updateData = { ...req.body };
    delete updateData.system;
    
    // Manually set updatedAt timestamp
    updateData.updatedAt = new Date();

    const race = await Race.findOneAndUpdate(
      { slug: req.params.sectionSlug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!race) return next(new AppError('No Race found with that slug', 404));

    res.status(200).json({
      status: 'success',
      data: {
        race: race
      }
    });
  }
);

exports.deleteRace = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const race = await Race.findOneAndDelete({ slug: req.params.sectionSlug });

    if (!race) return next(new AppError('No Race found with that slug', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);
