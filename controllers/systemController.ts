import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Models
const System = require('../models/systemModel');
const SystemCharacter = require('../models/systemCharacterModel');
const Ability = require('../models/abilityModel');
const Role = require('../models/roleModel');
const Race = require('../models/raceModel');

// Utils
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// =============================================================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// =============================================================================

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'public/img/systems');
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = file.mimetype.split('/')[1];
    const filename = `system-background-${req.params.systemSlug}-${Date.now()}.${ext}`;
    cb(null, filename);
  }
});

const multerFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadBackgroundImage = upload.single('backgroundImage');

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates abilities for a system and returns their IDs
 */
const createSystemAbilities = async (abilities: any[], systemId: string): Promise<string[]> => {
  if (!abilities || !Array.isArray(abilities)) return [];
  
  const abilityIds = [];
  
  for (let i = 0; i < abilities.length; i++) {
    const abilityData = abilities[i];
    if (abilityData.name && abilityData.name.trim()) {
      const ability = await Ability.create({
        name: abilityData.name.trim(),
        description: abilityData.description || '',
        system: systemId,
        order: abilityData.order !== undefined ? abilityData.order : i
      });
      abilityIds.push(ability._id);
    }
  }
  
  return abilityIds;
};

/**
 * Cascade delete all system-related data
 */
const cascadeDeleteSystemData = async (systemId: string, characterId?: string): Promise<void> => {
  // Delete all system-related data in parallel for better performance
  await Promise.all([
    Role.deleteMany({ system: systemId }),
    Race.deleteMany({ system: systemId }),
    Ability.deleteMany({ system: systemId }),
    characterId ? SystemCharacter.findByIdAndDelete(characterId) : Promise.resolve()
  ]);
};

// =============================================================================
// SYSTEM CRUD OPERATIONS
// =============================================================================

exports.getAllSystems = factory.getAll(System);

exports.getSystem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const system = await System.findOne({ slug: req.params.systemSlug });
  
  if (!system) {
    return next(new AppError('No System found with that Slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: system
  });
});

exports.createSystem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { abilities, ...systemData } = req.body;

  // Create the system first
  const system = await System.create(systemData);

  // Handle abilities creation if provided
  if (abilities && Array.isArray(abilities)) {
    const abilityIds = await createSystemAbilities(abilities, system._id);
    
    if (abilityIds.length > 0) {
      system.abilities = abilityIds;
      await system.save();
    }
  }

  // Populate abilities for response, sorted by order
  await system.populate({
    path: 'abilities',
    options: { sort: { order: 1 } }
  });

  res.status(201).json({
    status: 'success',
    data: system
  });
});

exports.updateSystem = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { abilities, ...systemUpdates } = req.body;
  
  // Handle file upload
  if (req.file) {
    systemUpdates.backgroundImage = req.file.filename;
  }

  // Find the existing system
  const existingSystem = await System.findOne({ slug: req.params.systemSlug });
  if (!existingSystem) {
    return next(new AppError('No System found with that Slug', 404));
  }

  // Handle abilities update if provided
  if (abilities && Array.isArray(abilities)) {
    // Remove existing abilities for this system
    await Ability.deleteMany({ system: existingSystem._id });

    // Create new abilities
    const abilityIds = await createSystemAbilities(abilities, existingSystem._id);
    systemUpdates.abilities = abilityIds;
  }

  // Manually set updatedAt timestamp
  systemUpdates.updatedAt = new Date();

  // Update the system
  const system = await System.findOneAndUpdate(
    { slug: req.params.systemSlug },
    systemUpdates,
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'abilities',
    options: { sort: { order: 1 } }
  });

  res.status(200).json({
    status: 'success',
    data: system
  });
});

exports.deleteSystem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { systemSlug } = req.params;
  
  // Find the system by slug
  const system = await System.findOne({ slug: systemSlug }).populate('character');
  if (!system) {
    return next(new AppError('No System found with that slug', 404));
  }
  
  try {
    // Cascade delete all related data
    await cascadeDeleteSystemData(system._id, system.character?._id);
    
    // Delete the system itself
    await System.findByIdAndDelete(system._id);
    
  } catch (error) {
    return next(new AppError('Failed to delete system and related data', 500));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// =============================================================================
// SYSTEM NAVIGATION AND CHARACTER DATA
// =============================================================================

exports.getSystemNavigation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const system = await System.findOne({ slug: req.params.systemSlug }).select(
    'name character slug id'
  );

  if (!system) {
    return next(new AppError('No System found with that Slug', 404));
  }

  const navigation = [
    {
      name: 'Roles',
      slug: 'roles',
      children: system.character.roles.map((role: any) => ({
        name: role.name,
        slug: role.slug
      }))
    },
    {
      name: 'Races',
      slug: 'races',
      children: system.character.races.map((race: any) => ({
        name: race.name,
        slug: race.slug
      }))
    }
  ];

  res.status(200).json({
    status: 'success',
    data: {
      system: system.name,
      systemSlug: system.slug,
      systemId: system.id,
      navigation
    }
  });
});

exports.getSystemCharacter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const system = await System.findById(req.params.systemId).select(
    'name id character'
  );

  if (!system) {
    return next(new AppError('No System found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      breadcrumbs: {
        system: {
          name: system.name,
          id: system.id
        }
      },
      character: system.character
    }
  });
});

exports.getSystemIntroduction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const system = await System.findOne({ slug: req.params.systemSlug });

  if (!system) {
    return next(new AppError('No System found with that Slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: system
  });
});