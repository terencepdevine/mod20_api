const express = require('express');
const weaponTaxonomyController = require('../controllers/weaponTaxonomyController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(weaponTaxonomyController.getAllWeaponTaxonomies)
  .post(authController.protect, authController.restrictTo('admin'), weaponTaxonomyController.createWeaponTaxonomy);

router
  .route('/:id')
  .get(weaponTaxonomyController.getWeaponTaxonomy)
  .patch(authController.protect, authController.restrictTo('admin'), weaponTaxonomyController.updateWeaponTaxonomy)
  .delete(authController.protect, authController.restrictTo('admin'), weaponTaxonomyController.deleteWeaponTaxonomy);

module.exports = router;
