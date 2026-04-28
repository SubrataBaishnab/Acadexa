const express = require('express');
const router = express.Router();
const {
  createDeadline,
  getDeadlineByStudent,
  updateDeadline,
  analyzeBurnout,
} = require('../controllers/deadlineController');

router.post('/create', createDeadline);
router.post('/burnout', analyzeBurnout);        // ← moved UP above /:studentId
router.get('/:studentId', getDeadlineByStudent);
router.put('/update/:id', updateDeadline);

module.exports = router;