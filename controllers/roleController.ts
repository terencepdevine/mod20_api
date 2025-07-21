import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import Role from '../models/roleModel';
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
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

exports.uploadRoleImage = upload.single('photo');

exports.getRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findOne({ slug: req.params.sectionSlug });
    if (!role) return next(new AppError('No Role found with that Slug', 404));

    res.status(200).json({
      status: 'success',
      data: {
        breadcrumbs: {},
        role: role
      }
    });
  }
);

exports.createRole = factory.createOne(Role);
// exports.updateRole = factory.updateOne(Role);

exports.updateRole = catchAsync(
  async (req: RequestWithFile, res: Response, next: NextFunction) => {
    if (req.file) {
      req.body.photo = req.file.filename;
    }
    const role = await Role.findOneAndUpdate(
      { slug: req.params.sectionSlug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!role) return next(new AppError('No Role found with that slug', 404));

    res.status(200).json({
      status: 'success',
      data: role
    });
  }
);

exports.deleteRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findOneAndDelete({ slug: req.params.sectionSlug });
    if (!role) return next(new AppError('No Role found with that slug', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// exports.deleteRole = factory.deleteOne(Role);
