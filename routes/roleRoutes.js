const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router
  .route('/:sectionSlug')
  .get(roleController.getRole)
  .patch(roleController.uploadRoleImage, roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
