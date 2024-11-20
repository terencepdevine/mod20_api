const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

router.route('/:systemId').get(systemController.getSystemNavigation);

module.exports = router;
