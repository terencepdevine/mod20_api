const mongoose = require('mongoose');

const ArmorTaxonomySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('ArmorTaxonomy', ArmorTaxonomySchema);
