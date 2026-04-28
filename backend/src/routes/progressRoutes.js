const express = require('express');
const router = express.Router();
const {
  submitProgressUpdate,
  editProgressUpdate,
  getStudentProgress,
  getSupervisorProgress,
  updateProgressStatus,
  addProgressComment,
  deleteProgressUpdate,
} = require('../controllers/progressController');

// POST   /api/progress               — Student submits a monthly update
router.post('/', submitProgressUpdate);

// PATCH  /api/progress/:id           — Student edits a pending submission
router.patch('/:id', editProgressUpdate);

// GET    /api/progress/student/:studentId
router.get('/student/:studentId', getStudentProgress);

// GET    /api/progress/supervisor/:supervisorId
router.get('/supervisor/:supervisorId', getSupervisorProgress);

// PATCH  /api/progress/:id/status    — Supervisor updates the status
router.patch('/:id/status', updateProgressStatus);

// POST   /api/progress/:id/comment   — Supervisor adds a comment
router.post('/:id/comment', addProgressComment);

// DELETE /api/progress/:id           — Student deletes (only if Pending Review)
router.delete('/:id', deleteProgressUpdate);

module.exports = router;