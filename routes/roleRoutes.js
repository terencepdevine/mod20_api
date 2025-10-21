const express = require('express');
const roleController = require('../controllers/roleController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(roleController.getAllRoles)
  .post(authController.protect, authController.restrictTo('admin'), roleController.createRole);

router
  .route('/:sectionSlug')
  .get(roleController.getRole)
  .patch(authController.protect, authController.restrictTo('admin'), roleController.uploadRoleImages, roleController.updateRole)
  .delete(authController.protect, authController.restrictTo('admin'), roleController.deleteRole);

router
  .route('/:sectionSlug/images/:imageIndex')
  .delete(authController.protect, authController.restrictTo('admin'), roleController.deleteRoleImage);

router
  .route('/:sectionSlug/character-sheets')
  .post(authController.protect, authController.restrictTo('admin'), roleController.uploadCharacterSheet, roleController.addCharacterSheet);

router
  .route('/:sectionSlug/character-sheets/:sheetIndex')
  .delete(authController.protect, authController.restrictTo('admin'), roleController.deleteCharacterSheet);

module.exports = router;
