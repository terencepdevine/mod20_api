const Trait = require('../models/traitModel');
const factory = require('./handlerFactory');

exports.getAllTraits = factory.getAll(Trait);
exports.getTrait = factory.getOne(Trait);
exports.createTrait = factory.createOne(Trait);
exports.updateTrait = factory.updateOne(Trait);
exports.deleteTrait = factory.deleteOne(Trait);
