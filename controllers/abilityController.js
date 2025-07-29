const Ability = require('../models/abilityModel');
const Role = require('../models/roleModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllAbilities = factory.getAll(Ability);
exports.getAbility = factory.getOne(Ability);
exports.createAbility = factory.createOne(Ability);
exports.updateAbility = factory.updateOne(Ability);

// Custom delete function to handle references in other collections
exports.deleteAbility = catchAsync(async (req, res, next) => {
  const ability = await Ability.findById(req.params.id);
  
  if (!ability) {
    return next(new AppError('No Ability found with that ID', 404));
  }

  // Clean up references in Roles
  // Set primaryAbility to null for any roles that reference this ability
  await Role.updateMany(
    { primaryAbility: req.params.id },
    { $set: { primaryAbility: null } }
  );

  // Remove from savingThrows arrays
  await Role.updateMany(
    { savingThrows: req.params.id },
    { $pull: { savingThrows: req.params.id } }
  );

  // Delete the ability
  await Ability.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
