const express = require('express');
const router = express.Router();
const {
  submitReview,
  getReviewsById,
  checkReviewed,
  getAllSupervisorSummaries,
} = require('../controllers/supervisorReviewController');

// GET  /api/reviews/summary/all
router.get('/summary/all', getAllSupervisorSummaries);

// GET  /api/reviews/check/:type/:id/:studentId
router.get('/check/:type/:id/:studentId', checkReviewed);

// GET  /api/reviews/:type/:id  — supervisor or professor
router.get('/:type/:id', getReviewsById);

// POST /api/reviews/:type/:id
router.post('/:type/:id', submitReview);

module.exports = router;