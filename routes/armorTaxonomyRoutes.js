const express = require('express');
const armorTaxonomyController = require('../controllers/armorTaxonomyController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(armorTaxonomyController.getAllArmorTaxonomies)
  .post(armorTaxonomyController.createArmorTaxonomy);

router
  .route('/:id')
  .get(armorTaxonomyController.getArmorTaxonomy)
  .patch(armorTaxonomyController.updateArmorTaxonomy)
  .delete(armorTaxonomyController.deleteArmorTaxonomy);

module.exports = router;
