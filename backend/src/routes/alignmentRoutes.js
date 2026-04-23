const express = require('express');
const router = express.Router();

// Import the controller you just created
const { analyzeAlignment } = require('../controllers/alignmentController');

// Define the POST route that the React frontend will call
router.post('/analyze', analyzeAlignment);

module.exports = router;