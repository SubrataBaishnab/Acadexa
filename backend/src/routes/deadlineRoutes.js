const express = require('express');
const router = express.Router();
const {
  createDeadline,
  getDeadlineByStudent,
  updateDeadline,
  getStudentAnalytics,
  getAdminAnalytics,
  scheduleMeeting,
} = require('../controllers/deadlineController');

router.post('/create',           createDeadline);
router.put('/update/:id',        updateDeadline);
router.get('/analytics/admin',   getAdminAnalytics);
router.get('/analytics/:studentId', getStudentAnalytics);
router.post('/schedule-meeting', scheduleMeeting);

// Must be last to prevent interference with /analytics
router.get('/:studentId', getDeadlineByStudent);

module.exports = router;