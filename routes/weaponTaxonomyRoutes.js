const express = require('express');
const weaponTaxonomyController = require('../controllers/weaponTaxonomyController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(weaponTaxonomyController.getAllWeaponTaxonomies)
  .post(weaponTaxonomyController.createWeaponTaxonomy);

router
  .route('/:id')
  .get(weaponTaxonomyController.getWeaponTaxonomy)
  .patch(weaponTaxonomyController.updateWeaponTaxonomy)
  .delete(weaponTaxonomyController.deleteWeaponTaxonomy);

module.exports = router;
