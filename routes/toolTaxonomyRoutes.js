const express = require('express');
const toolTaxonomyController = require('../controllers/toolTaxonomyController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(toolTaxonomyController.getAllToolTaxonomies)
  .post(toolTaxonomyController.createToolTaxonomy);

router
  .route('/:id')
  .get(toolTaxonomyController.getToolTaxonomy)
  .patch(toolTaxonomyController.updateToolTaxonomy)
  .delete(toolTaxonomyController.deleteToolTaxonomy);

module.exports = router;