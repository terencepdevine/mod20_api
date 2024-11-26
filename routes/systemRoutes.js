const express = require('express');
const systemController = require('../controllers/systemController');
const roleRouter = require('../routes/roleRoutes');
const raceRouter = require('../routes/raceRoutes');
// const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/:systemId/navigation').get(systemController.getSystemNavigation);
router.route('/:systemId/character').get(systemController.getSystemCharacter);

router
  .route('/:systemId/introduction')
  .get(systemController.getSystemIntroduction);

router
  .route('/')
  .get(systemController.getAllSystems)
  .post(systemController.createSystem);

router
  .route('/:id')
  .get(systemController.getSystem)
  .patch(systemController.updateSystem)
  .delete(systemController.deleteSystem);

router.use('/:systemId/roles', roleRouter);
router.use('/:systemId/races', raceRouter);

module.exports = router;
