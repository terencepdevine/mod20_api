const WeaponTaxonomy = require('../models/weaponTaxonomyModel');
const factory = require('./handlerFactory');

exports.getAllWeaponTaxonomies = factory.getAll(WeaponTaxonomy);
exports.getWeaponTaxonomy = factory.getOne(WeaponTaxonomy);
exports.createWeaponTaxonomy = factory.createOne(WeaponTaxonomy);
exports.updateWeaponTaxonomy = factory.updateOne(WeaponTaxonomy);
exports.deleteWeaponTaxonomy = factory.deleteOne(WeaponTaxonomy);
