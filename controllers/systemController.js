const SystemCharacter = require('../models/systemCharacterModel');
const System = require('../models/systemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getSystemNavigation = catchAsync(async (req, res, next) => {
  const system = await System.findById(req.params.systemId).select(
    'name character'
  );

  if (!system) return next(new AppError('No System found with that ID', 404));

  const navigation = [
    {
      name: 'Roles',
      slug: 'roles',
      children: system.character.roles.map(role => ({
        name: role.name,
        id: role._id.toString()
      }))
    },
    {
      name: 'Races',
      slug: 'races',
      children: system.character.races.map(race => ({
        name: race.name,
        id: race._id.toString()
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
  if (!doc) return next(new AppError('No System found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      breadcrumbs: {
        system: {
          name: doc.name,
          id: doc.id
        }
        // section: {
        //   name:
        // }
      },
      character: doc.character
    }
  });
});

exports.getSystemIntroduction = catchAsync(async (req, res, next) => {
  const query = await System.findById(req.params.id)
    .select('name version')
    .setOptions({ skipPopulation: true });

  const doc = await query;
  if (!doc) return next(new AppError('No System found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: doc
  });
});

exports.getAllSystems = factory.getAll(System);
// exports.getSystem = factory.getOne(System);

exports.getSystem = catchAsync(async (req, res, next) => {
  const query = await System.findById(req.params.id);
  const doc = await query;
  if (!doc) return next(new AppError('No System found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: doc
  });
});

exports.createSystem = factory.createOne(System);

exports.updateSystem = catchAsync(async (req, res, next) => {
  const { characterUpdates, ...systemUpdates } = req.body;
  const system = await System.findByIdAndUpdate(req.params.id, systemUpdates, {
    new: true,
    runValidators: true
  });

  if (!system) return next(new AppError('No System found with that ID', 404));

  if (characterUpdates && system.character) {
    await SystemCharacter.findByIdAndUpdate(
      system.character,
      characterUpdates,
      {
        new: true,
        runValidators: true
      }
    );
  }

  const updatedSystem = await System.findById(req.params.id).populate(
    'character'
  );

  res.status(200).json({
    status: 'success',
    data: updatedSystem
  });
});

exports.deleteSystem = factory.deleteOne(System);
