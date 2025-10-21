"use strict";
const express = require('express');
const raceController = require('../controllers/raceController');
const authController = require('./../controllers/authController');
const router = express.Router({ mergeParams: true });
router
    .route('/')
    .get(raceController.getAllRaces)
    .post(authController.protect, authController.restrictTo('admin'), raceController.createRace);
router
    .route('/:sectionSlug')
    .get(raceController.getRace)
    .patch(authController.protect, authController.restrictTo('admin'), raceController.updateRace)
    .delete(authController.protect, authController.restrictTo('admin'), raceController.deleteRace);
router
    .route('/:sectionSlug/character-sheets')
    .post(authController.protect, authController.restrictTo('admin'), raceController.uploadCharacterSheet, raceController.addCharacterSheet);
router
    .route('/:sectionSlug/character-sheets/:sheetIndex')
    .delete(authController.protect, authController.restrictTo('admin'), raceController.deleteCharacterSheet);
module.exports = router;
