import express from 'express';
const conditionController = require('../controllers/conditionController');

const router = express.Router({ mergeParams: true });

// Routes for conditions within a system context
router
  .route('/')
  .get(conditionController.getConditionsBySystem)
  .post(conditionController.createCondition);

router
  .route('/:id')
  .get(conditionController.getCondition)
  .patch(conditionController.updateCondition)
  .delete(conditionController.deleteCondition);

// Global condition routes (for admin)
router
  .route('/all')
  .get(conditionController.getAllConditions);

module.exports = router;
