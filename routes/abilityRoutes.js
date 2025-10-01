const express = require('express');
const abilityController = require('../controllers/abilityController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(abilityController.getAllAbilities)
  .post(authController.protect, authController.restrictTo('admin'), abilityController.createAbility);

router
  .route('/:id')
  .get(abilityController.getAbility)
  .patch(authController.protect, authController.restrictTo('admin'), abilityController.updateAbility)
  .delete(authController.protect, authController.restrictTo('admin'), abilityController.deleteAbility);

module.exports = router;
