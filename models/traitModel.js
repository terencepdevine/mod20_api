const mongoose = require('mongoose');

const traitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('Trait', traitSchema);
