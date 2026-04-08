const express = require('express');
const router = express.Router();
const {
  addQuestion,
  getQuestions,
  mockVivaSession,
} = require('../controllers/vivaController');

// POST /api/viva/question/add
router.post('/question/add', addQuestion);

// GET /api/viva/questions
router.get('/questions', getQuestions);

// POST /api/viva/mock-session
router.post('/mock-session', mockVivaSession);

module.exports = router;