import express from 'express';
const traitController = require('../controllers/traitController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(traitController.getAllTraits)
  .post(traitController.createTrait);

router
  .route('/:sectionSlug')
  .get(traitController.getTrait)
  .patch(traitController.updateTrait)
  .delete(traitController.deleteTrait);

module.exports = router;