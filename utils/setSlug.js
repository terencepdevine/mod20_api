const slugify = require('slugify');
const mongoose = require('mongoose');

// Consistent slug options across the application
const SLUG_OPTIONS = { 
  lower: true,
  strict: true,
  remove: /[*+~.()'"!:@#]/g
};

function setSlug(next) {
  console.log('setSlug middleware called, this:', this.constructor.name, 'name:', this.name);
  // Handle save operations (new documents)
  if (this instanceof mongoose.Document && this.name) {
    console.log('Setting slug for document:', this.name);
    this.slug = slugify(this.name, SLUG_OPTIONS);
    console.log('Generated slug:', this.slug);
  } 
  // Handle update operations
  else if (this.getUpdate) {
    const update = this.getUpdate();
    if (update.name || update.$set?.name) {
      const name = update.name || update.$set?.name;
      if (update.$set) {
        update.$set.slug = slugify(name, SLUG_OPTIONS);
      } else {
        update.slug = slugify(name, SLUG_OPTIONS);
      }
    }
  }
  next();
}

module.exports = setSlug;
