const express = require('express');
const abilityController = require('../controllers/abilityController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(abilityController.getAllAbilities)
  .post(abilityController.createAbility);

router
  .route('/:id')
  .get(abilityController.getAbility)
  .patch(abilityController.updateAbility)
  .delete(abilityController.deleteAbility);

module.exports = router;
