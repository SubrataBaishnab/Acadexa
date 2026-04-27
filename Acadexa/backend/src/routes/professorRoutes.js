const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

// Get all professors
router.get('/', professorController.getAllProfessors);

// Get professor by ID
router.get('/:id', professorController.getProfessorById);

// Get recommended professors based on student profile
router.post('/recommendations', professorController.getRecommendedProfessors);

// Search professors
router.get('/search', professorController.searchProfessors);

module.exports = router;
