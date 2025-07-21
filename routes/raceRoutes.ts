const express = require('express');
const raceController = require('../controllers/raceController');
// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(raceController.getAllRaces)
  .post(raceController.createRace);

router
  .route('/:sectionSlug')
  .get(raceController.getRace)
  .patch(raceController.updateRace)
  .delete(raceController.deleteRace);

module.exports = router;
