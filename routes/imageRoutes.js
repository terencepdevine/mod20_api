const express = require('express');
const imageController = require('../controllers/imageController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Route for searching images (before /:id routes to avoid conflicts)
router.get('/search', imageController.searchImages);

router
  .route('/')
  .get(imageController.getAllImages)
  .post(authController.protect, imageController.uploadImageFile, imageController.uploadImage); // All authenticated users can upload

router
  .route('/:id')
  .get(imageController.getImage)
  .patch(authController.protect, imageController.updateImage) // All authenticated users can update
  .delete(authController.protect, authController.restrictTo('admin'), imageController.deleteImage); // Only admins can delete

module.exports = router;