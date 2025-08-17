import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Models
const System = require('../models/systemModel');
const SystemCharacter = require('../models/systemCharacterModel');
const Ability = require('../models/abilityModel');
const Skill = require('../models/skillModel');
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
const createSystemAbilities = async (abilities: any[], systemId: string): Promise<{ ids: string[], idMap: Map<string, string> }> => {
  if (!abilities || !Array.isArray(abilities)) return { ids: [], idMap: new Map() };
  
  const abilityIds = [];
  const idMap = new Map<string, string>(); // Maps frontend temp IDs to MongoDB ObjectIds
  
  for (let i = 0; i < abilities.length; i++) {
    const abilityData = abilities[i];
    if (abilityData.name && abilityData.name.trim()) {
      const ability = await Ability.create({
        name: abilityData.name.trim(),
        description: abilityData.description || '',
        abbr: abilityData.abbr || '',
        system: systemId,
        order: abilityData.order !== undefined ? abilityData.order : i
      });
      abilityIds.push(ability._id);
      
      // Map the frontend temp ID to the real MongoDB ObjectId
      if (abilityData.id) {
        idMap.set(abilityData.id, ability._id.toString());
      }
    }
  }
  
  return { ids: abilityIds, idMap };
};

/**
 * Creates skills for a system and returns their IDs
 */
const createSystemSkills = async (skills: any[], systemId: string, abilityIdMap: Map<string, string>): Promise<string[]> => {
  if (!skills || !Array.isArray(skills)) return [];
  
  const skillIds = [];
  
  for (const skillData of skills) {
    if (skillData.name && skillData.name.trim()) {
      // Convert frontend ability ID to MongoDB ObjectId using the mapping
      let relatedAbilityId = null;
      if (skillData.relatedAbility) {
        // Check if it's a temp ID that needs mapping
        const mappedId = abilityIdMap.get(skillData.relatedAbility);
        relatedAbilityId = mappedId || skillData.relatedAbility;
      }
      
      const skill = await Skill.create({
        name: skillData.name.trim(),
        description: skillData.description || '',
        relatedAbility: relatedAbilityId,
        system: systemId
      });
      skillIds.push(skill._id);
    }
  }
  
  return skillIds;
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
    Skill.deleteMany({ system: systemId }),
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
  const { abilities, skills, ...systemData } = req.body;

  // Create the system first
  const system = await System.create(systemData);

  // Handle abilities creation if provided
  let abilityIdMap = new Map<string, string>();
  if (abilities && Array.isArray(abilities)) {
    const { ids: abilityIds, idMap } = await createSystemAbilities(abilities, system._id);
    abilityIdMap = idMap;
    if (abilityIds.length > 0) {
      system.abilities = abilityIds;
    }
  }

  // Handle skills creation if provided (must happen after abilities for ID mapping)
  if (skills && Array.isArray(skills)) {
    const skillIds = await createSystemSkills(skills, system._id, abilityIdMap);
    if (skillIds.length > 0) {
      system.skills = skillIds;
    }
  }

  // Save if we added abilities or skills
  if ((abilities && abilities.length > 0) || (skills && skills.length > 0)) {
    await system.save();
  }

  // Populate abilities and skills for response
  await system.populate([
    {
      path: 'abilities',
      options: { sort: { order: 1 } }
    },
    {
      path: 'skills',
      select: 'name description relatedAbility'
    }
  ]);

  res.status(201).json({
    status: 'success',
    data: system
  });
});

exports.updateSystem = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { abilities, skills, ...systemUpdates } = req.body;
  
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
  let abilityIdMap = new Map<string, string>();
  
  // First, build a map of ALL existing abilities for the system (for skill references)
  const allExistingAbilities = await Ability.find({ system: existingSystem._id });
  allExistingAbilities.forEach((ability: any) => {
    abilityIdMap.set(ability._id.toString(), ability._id.toString());
  });
  
  if (abilities && Array.isArray(abilities)) {
    const abilityIds = [];
    
    // Get current abilities for comparison
    const currentAbilities = await Ability.find({ system: existingSystem._id });
    const currentAbilityIds = currentAbilities.map((ability: any) => ability._id.toString());
    
    // Process each ability in the submitted list
    for (let i = 0; i < abilities.length; i++) {
      const abilityData = abilities[i];
      
      if (abilityData.id && currentAbilityIds.includes(abilityData.id.toString())) {
        // Update existing ability (name, description, abbr, order) but preserve ObjectId
        await Ability.findByIdAndUpdate(abilityData.id, {
          name: abilityData.name?.trim(),
          order: abilityData.order !== undefined ? abilityData.order : i,
          description: abilityData.description || '',
          abbr: abilityData.abbr || ''
        });
        abilityIds.push(abilityData.id);
        // For existing abilities, the frontend ID should already be the real ObjectId
        abilityIdMap.set(abilityData.id, abilityData.id);
      } else if (abilityData.name && abilityData.name.trim()) {
        // Create new ability (for abilities without id or with invalid id)
        const newAbility = await Ability.create({
          name: abilityData.name.trim(),
          description: abilityData.description || '',
          abbr: abilityData.abbr || '',
          system: existingSystem._id,
          order: abilityData.order !== undefined ? abilityData.order : i
        });
        abilityIds.push(newAbility._id);
        // Map frontend temp ID to real ObjectId for new abilities
        if (abilityData.id) {
          abilityIdMap.set(abilityData.id, newAbility._id.toString());
        }
      }
    }
    
    // Find abilities that were removed
    const newAbilityIds = abilityIds.map((id: any) => id.toString());
    const abilitiesToDelete = currentAbilityIds.filter((id: string) => !newAbilityIds.includes(id));
    
    if (abilitiesToDelete.length > 0) {
      // Clean up references in roles before deleting abilities
      await Role.updateMany(
        { primaryAbility: { $in: abilitiesToDelete } },
        { $set: { primaryAbility: null } }
      );
      await Role.updateMany(
        { savingThrows: { $in: abilitiesToDelete } },
        { $pullAll: { savingThrows: abilitiesToDelete } }
      );
      
      // Delete the abilities
      await Ability.deleteMany({ _id: { $in: abilitiesToDelete } });
    }
    
    // Update the system's abilities array
    systemUpdates.abilities = abilityIds;
  }

  // Handle skills update if provided
  if (skills && Array.isArray(skills)) {
    const skillIds = [];
    
    // Get current skills for comparison
    const currentSkills = await Skill.find({ system: existingSystem._id });
    const currentSkillIds = currentSkills.map((skill: any) => skill._id.toString());
    
    // Process each skill in the submitted list
    for (const skillData of skills) {
      // Convert frontend ability ID to MongoDB ObjectId using the mapping
      let relatedAbilityId = null;
      if (skillData.relatedAbility) {
        const mappedId = abilityIdMap.get(skillData.relatedAbility);
        relatedAbilityId = mappedId || skillData.relatedAbility;
      }
      
      if (skillData.id && currentSkillIds.includes(skillData.id.toString())) {
        // Update existing skill
        await Skill.findByIdAndUpdate(skillData.id, {
          name: skillData.name?.trim(),
          description: skillData.description || '',
          relatedAbility: relatedAbilityId
        });
        skillIds.push(skillData.id); // This should already be a valid ObjectId string from existing skills
      } else if (skillData.name && skillData.name.trim()) {
        // Create new skill
        const newSkill = await Skill.create({
          name: skillData.name.trim(),
          description: skillData.description || '',
          relatedAbility: relatedAbilityId,
          system: existingSystem._id
        });
        skillIds.push(newSkill._id);
      }
    }
    
    // Find skills that were removed
    const newSkillIds = skillIds.map((id: any) => id.toString());
    const skillsToDelete = currentSkillIds.filter((id: string) => !newSkillIds.includes(id));
    
    if (skillsToDelete.length > 0) {
      // Delete the removed skills
      await Skill.deleteMany({ _id: { $in: skillsToDelete } });
    }
    
    // Update the system's skills array
    systemUpdates.skills = skillIds;
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
  ).populate([
    {
      path: 'abilities',
      options: { sort: { order: 1 } }
    },
    {
      path: 'skills',
      select: 'name description relatedAbility'
    }
  ]);

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