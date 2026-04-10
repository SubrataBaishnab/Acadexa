const express = require('express');
const router = express.Router();
const {
  createDeadline,
  getDeadlineByStudent,
  updateDeadline,
} = require('../controllers/deadlineController');

// POST /api/deadline/create
router.post('/create', createDeadline);

// GET /api/deadline/:studentId
router.get('/:studentId', getDeadlineByStudent);

// PUT /api/deadline/update/:id
router.put('/update/:id', updateDeadline);

module.exports = router;
