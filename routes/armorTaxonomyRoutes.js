const express = require('express');
const armorTaxonomyController = require('../controllers/armorTaxonomyController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(armorTaxonomyController.getAllArmorTaxonomies)
  .post(authController.protect, authController.restrictTo('admin'), armorTaxonomyController.createArmorTaxonomy);

router
  .route('/:id')
  .get(armorTaxonomyController.getArmorTaxonomy)
  .patch(authController.protect, authController.restrictTo('admin'), armorTaxonomyController.updateArmorTaxonomy)
  .delete(authController.protect, authController.restrictTo('admin'), armorTaxonomyController.deleteArmorTaxonomy);

module.exports = router;
