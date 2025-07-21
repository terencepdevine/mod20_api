const slugify = require('slugify');
const mongoose = require('mongoose');

function setSlug(next) {
  if (this.name) {
    if (this instanceof mongoose.Document) {
      this.slug = slugify(this.name, { lower: true });
    } else if (this.getUpdate().name) {
      this.getUpdate().slug = slugify(this.getUpdate().name, { lower: true });
    }
  }
  next();
}

module.exports = setSlug;
