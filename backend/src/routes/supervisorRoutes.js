const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');

// Get all supervisors
router.get('/', supervisorController.getAllSupervisors);

// Get supervisor by ID
router.get('/:id', supervisorController.getSupervisorById);

// Get recommended supervisors based on student profile
router.post('/recommendations', supervisorController.getRecommendedSupervisors);

// Search supervisors
router.get('/search', supervisorController.searchSupervisors);

module.exports = router;
