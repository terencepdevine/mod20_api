const ToolTaxonomy = require('../models/toolTaxonomyModel');
const factory = require('./handlerFactory');

exports.getAllToolTaxonomies = factory.getAll(ToolTaxonomy);
exports.getToolTaxonomy = factory.getOne(ToolTaxonomy);
exports.createToolTaxonomy = factory.createOne(ToolTaxonomy);
exports.updateToolTaxonomy = factory.updateOne(ToolTaxonomy);
exports.deleteToolTaxonomy = factory.deleteOne(ToolTaxonomy);