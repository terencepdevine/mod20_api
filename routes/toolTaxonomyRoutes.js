const express = require('express');
const toolTaxonomyController = require('../controllers/toolTaxonomyController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(toolTaxonomyController.getAllToolTaxonomies)
  .post(authController.protect, authController.restrictTo('admin'), toolTaxonomyController.createToolTaxonomy);

router
  .route('/:id')
  .get(toolTaxonomyController.getToolTaxonomy)
  .patch(authController.protect, authController.restrictTo('admin'), toolTaxonomyController.updateToolTaxonomy)
  .delete(authController.protect, authController.restrictTo('admin'), toolTaxonomyController.deleteToolTaxonomy);

module.exports = router;