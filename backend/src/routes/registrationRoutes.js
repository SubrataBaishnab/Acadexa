const express = require('express');
const router = express.Router();
const multer = require('multer');
const registrationController = require('../controllers/registrationController');

const upload = multer({ dest: 'uploads/' });

// Status Check
router.get('/status/:student_id', registrationController.checkStatus);

// --- MODULE 3: ADMIN DASHBOARD ---
router.get('/admin/workload', registrationController.getWorkloadDashboard);

// Module 1: AI Eligibility Gateway
router.post('/verify-eligibility', upload.single('transcript'), registrationController.verifyEligibility);

// Module 2 & 3: Gap Analyzer & Registration Workflow
router.post('/analyze-gap', registrationController.analyzeResearchGap);

// --- MODULE 2 & 3: INITIATE & CAPACITY CHECK ---
router.post('/initiate', registrationController.initiateRegistration);

router.put('/finalize', registrationController.finalizeRegistration);

// Dev Tool: Reset
router.delete('/reset/:student_id', registrationController.resetStudentData);

module.exports = router;