const Race = require('../models/raceModel');
const factory = require('./handlerFactory');

exports.getAllRaces = factory.getAll(Race);
exports.getRace = factory.getOne(Race);
exports.createRace = factory.createOne(Race);
exports.updateRace = factory.updateOne(Race);
exports.deleteRace = factory.deleteOne(Race);
