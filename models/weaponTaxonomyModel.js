const mongoose = require('mongoose');

const WeaponTaxonomySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('WeaponTaxonomy', WeaponTaxonomySchema);
