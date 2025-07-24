const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Route for searching images (before /:id routes to avoid conflicts)
router.get('/search', imageController.searchImages);

router
  .route('/')
  .get(imageController.getAllImages)
  .post(imageController.uploadImageFile, imageController.uploadImage);

router
  .route('/:id')
  .get(imageController.getImage)
  .patch(imageController.updateImage)
  .delete(imageController.deleteImage);

module.exports = router;