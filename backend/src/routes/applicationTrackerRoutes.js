const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/applicationTrackerController');

// POST /api/applications -> Track/bookmark a new professor
router.post('/', trackerController.trackProfessor);

// GET /api/applications/:studentId -> Get all applications for a student
router.get('/:studentId', trackerController.getStudentApplications);

// PUT /api/applications/:id -> Update status or notes
router.put('/:id', trackerController.updateApplication);

// DELETE /api/applications/:id -> Remove tracked application
router.delete('/:id', trackerController.removeApplication);

module.exports = router;
