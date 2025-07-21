const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

router.route('/:systemSlug').get(systemController.getSystemNavigation);

module.exports = router;
