const express = require('express');
const imageController = require('../controllers/imageController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Route for searching images (before /:id routes to avoid conflicts)
router.get('/search', imageController.searchImages);

router
  .route('/')
  .get(imageController.getAllImages)
  .post(authController.protect, authController.restrictTo('admin'), imageController.uploadImageFile, imageController.uploadImage);

router
  .route('/:id')
  .get(imageController.getImage)
  .patch(authController.protect, authController.restrictTo('admin'), imageController.updateImage)
  .delete(authController.protect, authController.restrictTo('admin'), imageController.deleteImage);

module.exports = router;