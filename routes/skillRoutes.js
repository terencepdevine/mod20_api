const express = require('express');
const skillController = require('../controllers/skillController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(skillController.getAllSkills)
  .post(skillController.createSkill);

router
  .route('/:id')
  .get(skillController.getSkill)
  .patch(skillController.updateSkill)
  .delete(skillController.deleteSkill);

module.exports = router;
