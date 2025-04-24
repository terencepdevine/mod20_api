const Ability = require('../models/abilityModel');
const factory = require('./handlerFactory');

exports.getAllAbilities = factory.getAll(Ability);
exports.getAbility = factory.getOne(Ability);
exports.createAbility = factory.createOne(Ability);
exports.updateAbility = factory.updateOne(Ability);
exports.deleteAbility = factory.deleteOne(Ability);
