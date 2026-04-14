const express = require('express');
const router = express.Router();
const multer = require('multer');
const registrationController = require('../controllers/registrationController');

const upload = multer({ dest: 'uploads/' });

// Module 1: AI Eligibility Gateway
router.post('/verify-eligibility', upload.single('transcript'), registrationController.verifyEligibility);

// Module 2: Gap Analyzer & Registration Workflow
router.post('/analyze-gap', registrationController.analyzeResearchGap);
router.post('/initiate', registrationController.initiateRegistration);
router.put('/finalize', registrationController.finalizeRegistration); // Should be protected by Admin Middleware later

module.exports = router;