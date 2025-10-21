const express = require('express');
const pdfController = require('../controllers/pdfController');
const authController = require('../controllers/authController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Upload PDF to library
router.post(
  '/upload',
  pdfController.uploadPdfMiddleware,
  pdfController.uploadPdf
);

// Get all PDFs for a system
router.get('/system/:systemId', pdfController.getPdfsBySystem);

// Update/Delete specific PDF
router
  .route('/:pdfId')
  .patch(pdfController.updatePdf)
  .delete(pdfController.deletePdf);

module.exports = router;
