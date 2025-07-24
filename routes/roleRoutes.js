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
  .patch(roleController.uploadRoleImages, roleController.updateRole)
  .delete(roleController.deleteRole);

router
  .route('/:sectionSlug/images/:imageIndex')
  .delete(roleController.deleteRoleImage);

module.exports = router;
