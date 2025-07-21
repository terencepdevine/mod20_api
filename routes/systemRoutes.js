const express = require('express');
const systemController = require('../controllers/systemController');
const roleRouter = require('../routes/roleRoutes');
const raceRouter = require('../routes/raceRoutes');
// const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/:systemSlug/navigation')
  .get(systemController.getSystemNavigation);
router.route('/:systemSlug/character').get(systemController.getSystemCharacter);

router
  .route('/:systemSlug/introduction')
  .get(systemController.getSystemIntroduction);

router
  .route('/')
  .get(systemController.getAllSystems)
  .post(systemController.createSystem);

router
  .route('/:systemSlug')
  .get(systemController.getSystem)
  .patch(systemController.uploadBackgroundImage, systemController.updateSystem)
  .delete(systemController.deleteSystem);

router.use('/:systemSlug/roles', roleRouter);
router.use('/:systemSlug/races', raceRouter);

module.exports = router;
