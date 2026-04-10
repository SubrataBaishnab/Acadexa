const express = require('express');
const router = express.Router();
const {
  submitProgressUpdate,
  getStudentProgress,
  getSupervisorProgress,
  updateProgressStatus,
  addProgressComment,
  deleteProgressUpdate,
} = require('../controllers/progressController');

// POST /api/progress — Student submits a monthly update
router.post('/', submitProgressUpdate);

// GET /api/progress/student/:studentId — Get all updates for a student
router.get('/student/:studentId', getStudentProgress);

// GET /api/progress/supervisor/:supervisorId — Get all updates assigned to a supervisor
router.get('/supervisor/:supervisorId', getSupervisorProgress);

// PATCH /api/progress/:id/status — Supervisor updates the status
router.patch('/:id/status', updateProgressStatus);

// POST /api/progress/:id/comment — Supervisor adds a comment
router.post('/:id/comment', addProgressComment);

// DELETE /api/progress/:id — Student deletes their own update
router.delete('/:id', deleteProgressUpdate);

module.exports = router;
