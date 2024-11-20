const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      required: [true, 'An image must have a file path or URL'],
      trim: true
    },
    altText: {
      type: String,
      required: [true, 'An image must have alt text'],
      maxlength: [200, 'Alt text must have less than 200 characters'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description must have less than 500 characters'],
      trim: true
    },
    artistName: {
      type: String,
      required: [true, 'An image must have an artist name'],
      maxlength: [100, 'Artist name must have less than 100 characters'],
      trim: true
    },
    artistUrl: {
      type: String,
      // validate: {
      //   validator: function(val) {
      //     return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(
      //       val
      //     );
      //   },
      //   message: 'Artist URL must be a valid URL'
      // },
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
