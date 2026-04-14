const express = require('express');
const router = express.Router();
const synopsisController = require('../controllers/synopsisController');

// Utility endpoints for pseudo-login
router.post('/seed-students', synopsisController.seedStudents);
router.get('/login-users', synopsisController.getLoginUsers);

// Synopsis Core logic
router.post('/idea', synopsisController.submitIdea);
router.put('/:id/full', synopsisController.submitFullSynopsis);
router.put('/:id/status', synopsisController.updateStatus);

// Dashboards
router.get('/student/:studentId', synopsisController.getStudentDashboard);
router.get('/supervisor/:supervisorId', synopsisController.getSupervisorDashboard);

module.exports = router;
