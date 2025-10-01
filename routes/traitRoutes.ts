import express from 'express';
const traitController = require('../controllers/traitController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(traitController.getAllTraits)
  .post(authController.protect, authController.restrictTo('admin'), traitController.createTrait);

router
  .route('/:sectionSlug')
  .get(traitController.getTrait)
  .patch(authController.protect, authController.restrictTo('admin'), traitController.updateTrait)
  .delete(authController.protect, authController.restrictTo('admin'), traitController.deleteTrait);

module.exports = router;