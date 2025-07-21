const multer = require('multer');
const SystemCharacter = require('../models/systemCharacterModel');
const System = require('../models/systemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/systems');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const filename = `system-background-${
      req.params.sectionSlug
    }-${Date.now()}.${ext}`;
    cb(null, filename);
  }
});

const multerFilter = (req, file, cb) => {
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

exports.getSystemNavigation = catchAsync(async (req, res, next) => {
  const system = await System.findOne({ slug: req.params.systemSlug }).select(
    'name character slug id'
  );

  if (!system) return next(new AppError('No System found with that Slug', 404));

  const navigation = [
    {
      name: 'Roles',
      slug: 'roles',
      children: system.character.roles.map(role => ({
        name: role.name,
        slug: role.slug
      }))
    },
    {
      name: 'Races',
      slug: 'races',
      children: system.character.races.map(race => ({
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

exports.getSystemCharacter = catchAsync(async (req, res, next) => {
  const query = await System.findById(req.params.systemId).select(
    'name id character'
  );

  const doc = await query;
  if (!doc) return next(new AppError('No System found with that Slug', 404));

  res.status(200).json({
    status: 'success',
    data: {
      breadcrumbs: {
        system: {
          name: doc.name,
          id: doc.id
        }
      },
      character: doc.character
    }
  });
});

exports.getSystemIntroduction = catchAsync(async (req, res, next) => {
  const doc = await System.findOne({ slug: req.params.systemSlug });

  if (!doc) return next(new AppError('No System found with that Slug', 404));

  res.status(200).json({
    status: 'success',
    data: { test: doc }
  });
});

exports.getAllSystems = factory.getAll(System);
// exports.getSystem = factory.getOne(System);

exports.getSystem = catchAsync(async (req, res, next) => {
  const system = await System.findOne({ slug: req.params.systemSlug });
  if (!system) return next(new AppError('No System found with that Slug', 404));

  res.status(200).json({
    status: 'success',
    data: system
  });
});

exports.createSystem = factory.createOne(System);

exports.updateSystem = catchAsync(async (req, res, next) => {
  const { characterUpdates, roles, races, ...systemUpdates } = req.body;

  if (req.file) {
    req.body.backgroundImage = req.file.filename;
  }

  const system = await System.findOneAndUpdate(
    { slug: req.params.systemSlug },
    systemUpdates,
    {
      new: true,
      runValidators: true
    }
  );

  if (!system) return next(new AppError('No System found with that Slug', 404));

  // if (system.character) {
  //   const characterUpdateFields = { ...characterUpdates };

  //   if (roles) {
  //     characterUpdateFields.roles = roles;
  //   }
  //   if (races) {
  //     characterUpdateFields.races = races;
  //   }

  //   await SystemCharacter.findByIdAndUpdate(
  //     system.character,
  //     characterUpdateFields,
  //     {
  //       new: true,
  //       runValidators: true
  //     }
  //   );
  // }

  // const updatedSystem = await System.findOne({
  //   slug: req.params.systemSlug
  // }).populate('character');

  res.status(200).json({
    status: 'success',
    data: system
  });
});

exports.deleteSystem = factory.deleteOne(System);
