const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Get smart recommendation with chatbot
router.post('/recommendation', chatbotController.getSmartRecommendation);

// Generate email draft
router.post('/email-draft', chatbotController.generateDraftEmail);

module.exports = router;
