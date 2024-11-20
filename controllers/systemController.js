const System = require('../models/systemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getSystemNavigation = catchAsync(async (req, res, next) => {
  const system = await System.findById(req.params.id).select(
    'name roles races'
  );

  if (!system) return next(new AppError('No System found with that ID', 404));

  const navigation = [
    {
      name: 'Roles',
      slug: 'roles',
      children: system.roles.map(role => ({
        name: role.name,
        id: role._id.toString()
      }))
    },
    {
      name: 'Races',
      slug: 'races',
      children: system.races.map(race => ({
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
exports.getSystem = factory.getOne(System);
exports.createSystem = factory.createOne(System);
exports.updateSystem = factory.updateOne(System);
exports.deleteSystem = factory.deleteOne(System);
