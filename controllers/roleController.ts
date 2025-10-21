import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const Role = require('../models/roleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

interface RequestWithFiles extends Request {
  files?: Express.Multer.File[];
}

exports.getAllRoles = factory.getAll(Role);

const multerStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'public/img/roles');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split('/')[1];
    const filename = `role-${req.params.sectionSlug}-${Date.now()}.${ext}`;
    cb(null, filename);
  }
});

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadRoleImages = upload.array('images', 9);

// PDF upload configuration for character sheets
const pdfStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'public/pdf/roles');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split('/')[1];
    const filename = `character-sheet-${req.params.sectionSlug}-${Date.now()}.${ext}`;
    cb(null, filename);
  }
});

const pdfFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Not a PDF! Please upload only PDF files.', 400));
  }
};

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter
});

exports.uploadCharacterSheet = uploadPdf.single('characterSheet');

exports.getRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findOne({ slug: req.params.sectionSlug }).populate({
      path: 'primaryAbility',
      select: 'name description'
    });
    if (!role) return next(new AppError('No Role found with that Slug', 404));

    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });
  }
);

exports.createRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newRole = await Role.create(req.body);
    
    // Add the role to the SystemCharacter's roles array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    
    // Find the system and get its character
    const system = await System.findById(req.body.system);
    
    if (system && system.character) {
      await SystemCharacter.findByIdAndUpdate(
        system.character,
        { $addToSet: { roles: newRole._id } },
        { new: true }
      );
    }
    
    // Populate the role with primaryAbility like getRole does
    const populatedRole = await Role.findById(newRole._id).populate({
      path: 'primaryAbility',
      select: 'name description'
    });

    res.status(201).json({
      status: 'success',
      data: {
        role: populatedRole
      }
    });
  }
);
// exports.updateRole = factory.updateOne(Role);

exports.updateRole = catchAsync(
  async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    // Handle file uploads (for new image uploads via file input)
    if (req.files && req.files.length > 0) {
      // Get existing images from the role
      const existingRole = await Role.findOne({ slug: req.params.sectionSlug });
      const existingImages = existingRole?.images || [];

      // Add new image filenames with orderby values
      const newImages = req.files.map((file, index) => ({
        imageId: file.filename,
        orderby: existingImages.length + index
      }));
      const allImages = [...existingImages, ...newImages];

      // Ensure we don't exceed 9 images
      if (allImages.length > 9) {
        return next(new AppError('Cannot have more than 9 images. Please remove some existing images first.', 400));
      }

      req.body.images = allImages;
    }

    // Handle ordered image structure updates (from drag and drop reordering)
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

    // Handle ordered character sheets structure updates (from drag and drop reordering)
    if (req.body.characterSheets && Array.isArray(req.body.characterSheets)) {
      // Validate the ordered character sheets structure
      const isValidStructure = req.body.characterSheets.every((sheet: any) =>
        sheet && typeof sheet.name === 'string' && typeof sheet.fileId === 'string' && typeof sheet.orderby === 'number'
      );

      if (!isValidStructure) {
        return next(new AppError('Invalid character sheets structure. Expected array of {name: string, fileId: string, orderby: number}', 400));
      }

      // Sort by orderby to maintain consistency
      req.body.characterSheets = req.body.characterSheets.sort((a: any, b: any) => a.orderby - b.orderby);
    }

    // Remove system field from updates to preserve existing system association
    const updateData = { ...req.body };
    delete updateData.system;


    const role = await Role.findOneAndUpdate(
      { slug: req.params.sectionSlug },
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'primaryAbility',
      select: 'name description'
    });
    if (!role) return next(new AppError('No Role found with that slug', 404));

    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });
  }
);

exports.deleteRoleImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { imageIndex } = req.params;
    const role = await Role.findOne({ slug: req.params.sectionSlug });

    if (!role) return next(new AppError('No Role found with that slug', 404));
    if (!role.images || role.images.length === 0) {
      return next(new AppError('No images found for this role', 404));
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= role.images.length) {
      return next(new AppError('Invalid image index', 400));
    }

    // Remove image from array
    role.images.splice(index, 1);
    await role.save();

    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });
  }
);

exports.addCharacterSheet = catchAsync(
  async (req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction) => {
    const role = await Role.findOne({ slug: req.params.sectionSlug });

    if (!role) return next(new AppError('No Role found with that slug', 404));

    // Validate uploaded file and name
    if (!req.file) {
      return next(new AppError('Please upload a PDF file', 400));
    }

    if (!req.body.name) {
      return next(new AppError('Name is required for character sheet', 400));
    }

    const characterSheets = role.characterSheets || [];
    const newSheet = {
      name: req.body.name,
      fileId: req.file.filename, // Use the uploaded file's filename
      orderby: req.body.orderby !== undefined ? parseInt(req.body.orderby) : characterSheets.length
    };

    role.characterSheets = [...characterSheets, newSheet];
    await role.save();

    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });
  }
);

exports.deleteCharacterSheet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sheetIndex } = req.params;
    const role = await Role.findOne({ slug: req.params.sectionSlug });

    if (!role) return next(new AppError('No Role found with that slug', 404));
    if (!role.characterSheets || role.characterSheets.length === 0) {
      return next(new AppError('No character sheets found for this role', 404));
    }

    const index = parseInt(sheetIndex);
    if (index < 0 || index >= role.characterSheets.length) {
      return next(new AppError('Invalid character sheet index', 400));
    }

    // Remove character sheet from array
    role.characterSheets.splice(index, 1);
    await role.save();

    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });
  }
);

exports.deleteRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!role) return next(new AppError('No Role found with that slug', 404));

    // Remove the role from the SystemCharacter's roles array
    const SystemCharacter = require('../models/systemCharacterModel');
    const System = require('../models/systemModel');
    
    // Find the system and remove role from its character
    const system = await System.findById(role.system);
    if (system && system.character) {
      await SystemCharacter.findByIdAndUpdate(
        system.character,
        { $pull: { roles: role._id } }
      );
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// exports.deleteRole = factory.deleteOne(Role);
